import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  FileText, 
  Settings,
  Shield,
  Phone,
  Mail
} from 'lucide-react';

const AdminInstructionsTab: React.FC = () => {
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

      {/* Доступ к панели администратора */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Доступ к панели администратора
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Вход в систему:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Войдите на сайт с учетной записью администратора</li>
              <li>В верхнем меню нажмите "Админ" для доступа к панели управления</li>
              <li>Убедитесь, что у вас есть права администратора для полного доступа</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Управление недвижимостью */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Управление недвижимостью
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Вкладка "Опубликованные объекты":</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Просмотр:</strong> Список всех активных объектов недвижимости</li>
              <li><strong>Добавление:</strong> Кнопка "Добавить объект" для создания новых объявлений</li>
              <li><strong>Редактирование:</strong> Кнопка "Редактировать" для изменения данных объекта</li>
              <li><strong>Удаление:</strong> Кнопка "Удалить" для удаления объектов</li>
              <li><strong>Горячие предложения:</strong> Переключатель для выделения объектов</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">При добавлении/редактировании объекта:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Заполните все обязательные поля (название, цена, тип, местоположение)</li>
              <li>Добавьте подробное описание объекта</li>
              <li>Загрузите качественные фотографии</li>
              <li>Укажите точное местоположение на карте</li>
              <li>Добавьте контактную информацию для связи</li>
              <li>Выберите удобства из предложенного списка</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Обработка заявок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Обработка заявок на недвижимость
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Статусы заявок:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Badge variant="outline" className="mb-2">На рассмотрении</Badge>
                <p className="text-sm text-gray-600">Новые заявки, требующие проверки</p>
              </div>
              <div>
                <Badge variant="default" className="mb-2">Одобрено</Badge>
                <p className="text-sm text-gray-600">Заявки, переведенные в активные объявления</p>
              </div>
              <div>
                <Badge variant="destructive" className="mb-2">Отклонено</Badge>
                <p className="text-sm text-gray-600">Заявки, не прошедшие модерацию</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Запрос удаления</Badge>
                <p className="text-sm text-gray-600">Заявки на удаление от владельцев</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Действия с заявками:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Одобрить:</strong> Переводит заявку в активное объявление</li>
              <li><strong>Отклонить:</strong> Отклоняет заявку с возможностью указать причину</li>
              <li><strong>Удалить:</strong> Окончательно удаляет заявку из системы</li>
              <li><strong>Ответить:</strong> Отправить сообщение подавшему заявку</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Управление контентом */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Управление контентом
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Блог и новости:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Создание статей:</strong> Используйте встроенный редактор для создания контента</li>
              <li><strong>Публикация:</strong> Установите статус "Опубликовано" для показа на сайте</li>
              <li><strong>Изображения:</strong> Добавляйте обложки для привлекательности</li>
              <li><strong>Теги:</strong> Используйте теги для категоризации контента</li>
              <li><strong>SEO:</strong> Заполняйте мета-описания для поисковой оптимизации</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Управление чатами */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Управление чатами и сообщениями
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Работа с чатами:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Просматривайте все активные разговоры с пользователями</li>
              <li>Отвечайте на вопросы пользователей в режиме реального времени</li>
              <li>Создавайте новые разговоры с пользователями при необходимости</li>
              <li>Прикрепляйте файлы и изображения к сообщениям</li>
              <li>Отслеживайте историю всех сообщений</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Обработка обращений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-yellow-600" />
            Обработка контактных обращений
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Работа с обращениями:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Просматривайте все поступающие обращения от посетителей сайта</li>
              <li>Обновляйте статус обращений (Новое, В работе, Завершено)</li>
              <li>Добавляйте внутренние заметки для отслеживания прогресса</li>
              <li>Своевременно отвечайте на запросы клиентов</li>
              <li>Ведите статистику обращений по типам</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Управление командой */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Управление командой
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Редактирование команды:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Добавляйте новых сотрудников с их фотографиями и описанием</li>
              <li>Редактируйте информацию о существующих участниках команды</li>
              <li>Управляйте порядком отображения сотрудников</li>
              <li>Добавляйте ссылки на социальные сети и контакты</li>
              <li>Включайте/отключайте отображение сотрудников на сайте</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Системные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Системные настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Конфигурация системы:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Карты:</strong> Настройка токена для корректного отображения карт</li>
              <li><strong>Уведомления:</strong> Мониторинг счетчиков новых сообщений и обращений</li>
              <li><strong>Резервное копирование:</strong> Регулярное сохранение важных данных</li>
              <li><strong>Безопасность:</strong> Мониторинг подозрительной активности</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            Рекомендации по работе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Ежедневные задачи:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Проверяйте новые заявки на недвижимость</li>
              <li>Отвечайте на сообщения в чатах</li>
              <li>Обрабатывайте контактные обращения</li>
              <li>Мониторьте активность на сайте</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Еженедельные задачи:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Обновляйте контент блога и новостей</li>
              <li>Проверяйте актуальность информации об объектах</li>
              <li>Анализируйте статистику посещений</li>
              <li>Обновляйте информацию о команде при необходимости</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Важные принципы:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Всегда проверяйте качество загружаемых изображений</li>
              <li>Поддерживайте актуальность контактной информации</li>
              <li>Быстро реагируйте на обращения клиентов</li>
              <li>Ведите подробную документацию изменений</li>
              <li>Регулярно проверяйте работоспособность всех функций</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInstructionsTab;