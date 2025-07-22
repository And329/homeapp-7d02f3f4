
export interface NetworkDiagnostics {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface DNSTimings {
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}

export const getNetworkInfo = (): NetworkDiagnostics | null => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }
  return null;
};

export const getDNSTimings = (): DNSTimings | null => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    return {
      domainLookupStart: navigation.domainLookupStart,
      domainLookupEnd: navigation.domainLookupEnd,
      connectStart: navigation.connectStart,
      connectEnd: navigation.connectEnd,
      secureConnectionStart: navigation.secureConnectionStart,
      requestStart: navigation.requestStart,
      responseStart: navigation.responseStart,
      responseEnd: navigation.responseEnd
    };
  }
  
  return null;
};

export const logNetworkDiagnostics = () => {
  const networkInfo = getNetworkInfo();
  const dnsTimings = getDNSTimings();
  
  console.log('Network Diagnostics:', {
    domain: window.location.hostname,
    userAgent: navigator.userAgent,
    networkInfo,
    dnsTimings: dnsTimings ? {
      dnsLookup: `${Math.round(dnsTimings.domainLookupEnd - dnsTimings.domainLookupStart)}ms`,
      tcpConnect: `${Math.round(dnsTimings.connectEnd - dnsTimings.connectStart)}ms`,
      sslHandshake: dnsTimings.secureConnectionStart > 0 ? 
        `${Math.round(dnsTimings.connectEnd - dnsTimings.secureConnectionStart)}ms` : 'N/A',
      ttfb: `${Math.round(dnsTimings.responseStart - dnsTimings.requestStart)}ms`
    } : null
  });
};

export const testSupabaseConnection = async (): Promise<number> => {
  const start = performance.now();
  
  try {
    // Test connection to Supabase
    const response = await fetch('https://jwrzpawuvdqjintyhzkm.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cnpwYXd1dmRxamludHloemttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjkzMDYsImV4cCI6MjA2NTg0NTMwNn0.GnC-m7ke8NG6V_t8CgzHJbhq44lSK_XCXcNnbAs7Ha8'
      }
    });
    
    const latency = performance.now() - start;
    console.log(`Supabase connection test: ${Math.round(latency)}ms (${response.status})`);
    return latency;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return -1;
  }
};
