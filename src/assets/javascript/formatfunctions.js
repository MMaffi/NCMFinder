// Função para formatar o código NCM
function formatNCMCode(code) {
  if (code === "0") return "0";
  if (code.length === 8) {
    return code.substring(0, 4) + '.' + code.substring(4, 6) + '.' + code.substring(6, 8);
  }
  return code;
}

// Função para formatar data
function formatDate(dateString) {
  if (!dateString || dateString === '0000-00-00') return 'N/A';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}