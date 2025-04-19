export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 