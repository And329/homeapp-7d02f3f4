
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimplePropertyForm from '@/components/SimplePropertyForm';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ListProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Property submitted successfully!",
      description: "Your property has been submitted for review and will appear on the site once approved.",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">List Your Property</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit your property for listing. Our team will review and approve it within 24 hours.
          </p>
        </div>

        <SimplePropertyForm onSuccess={handleSuccess} />
      </div>

      <Footer />
    </div>
  );
};

export default ListProperty;
