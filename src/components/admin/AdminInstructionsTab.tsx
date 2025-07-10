import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  FileText, 
  Settings,
  Shield,
  Phone,
  Mail,
  Edit,
  Save,
  X
} from 'lucide-react';

// Определяем секции инструкций
const instructionSections = [
  {
    key: 'admin_instructions_access',
    title: 'Доступ к панели администратора',
    icon: Shield,
    color: 'text-green-600'
  },
  {
    key: 'admin_instructions_properties',
    title: 'Управление недвижимостью',
    icon: Building2,
    color: 'text-blue-600'
  },
  {
    key: 'admin_instructions_requests',
    title: 'Обработка заявок на недвижимость',
    icon: FileText,
    color: 'text-orange-600'
  },
  {
    key: 'admin_instructions_content',
    title: 'Управление контентом',
    icon: FileText,
    color: 'text-purple-600'
  },
  {
    key: 'admin_instructions_chats',
    title: 'Управление чатами и сообщениями',
    icon: MessageSquare,
    color: 'text-green-600'
  },
  {
    key: 'admin_instructions_contacts',
    title: 'Обработка контактных обращений',
    icon: Mail,
    color: 'text-yellow-600'
  },
  {
    key: 'admin_instructions_team',
    title: 'Управление командой',
    icon: Users,
    color: 'text-indigo-600'
  },
  {
    key: 'admin_instructions_recommendations',
    title: 'Рекомендации по работе',
    icon: Phone,
    color: 'text-red-600'
  }
];

const AdminInstructionsTab: React.FC = () => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загружаем настройки инструкций
  const { data: instructions, isLoading } = useQuery({
    queryKey: ['admin-instructions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, description')
        .in('key', instructionSections.map(section => section.key));

      if (error) throw error;
      return data;
    }
  });

  // Мутация для обновления инструкций
  const updateInstructionMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.rpc('upsert_setting', {
        setting_key: key,
        setting_value: value
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-instructions'] });
      toast({
        title: "Успешно",
        description: "Инструкция обновлена",
      });
      setEditingSection(null);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить инструкцию",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (key: string, currentValue: string) => {
    setEditingSection(key);
    setEditContent(currentValue);
  };

  const handleSave = () => {
    if (editingSection) {
      updateInstructionMutation.mutate({
        key: editingSection,
        value: editContent
      });
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditContent('');
  };

  // Получаем значение инструкции по ключу
  const getInstructionValue = (key: string) => {
    const instruction = instructions?.find(inst => inst.key === key);
    return instruction?.value || '';
  };

  // Рендеринг markdown контента как обычного текста
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-md font-medium mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-700">{line}</p>;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Загрузка инструкций...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Руководство администратора
        </h1>
        <p className="text-gray-600">
          Подробное руководство по управлению платформой недвижимости
        </p>
      </div>

      {instructionSections.map((section) => {
        const content = getInstructionValue(section.key);
        const isEditing = editingSection === section.key;
        const IconComponent = section.icon;

        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-5 w-5 ${section.color}`} />
                  {section.title}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateInstructionMutation.isPending}
                        className="h-8"
                      >
                        <Save className="h-4 w-4" />
                        Сохранить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="h-8"
                      >
                        <X className="h-4 w-4" />
                        Отмена
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(section.key, content)}
                      className="h-8"
                    >
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Введите текст инструкции в формате Markdown"
                  />
                  <div className="text-sm text-gray-500">
                    Поддерживается разметка Markdown: ## Заголовок 2, ### Заголовок 3, - Список
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  {content ? renderContent(content) : (
                    <p className="text-gray-500 italic">Инструкция не найдена</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminInstructionsTab;