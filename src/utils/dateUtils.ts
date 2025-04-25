
import { format as formatDate, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return formatDate(date, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-- / -- / ----';
  }
};

export const formatDateTime = (dateString: string) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return formatDate(date, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '-- / -- / ---- --:--';
  }
}; 
