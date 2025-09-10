// Função para copiar código NCM
async function copyNcmCode(code, button = null) {
  const codeToCopy = String(code).replace(/\./g, '');
  
  try {
    await navigator.clipboard.writeText(codeToCopy);
    
    if (button) {
      button.classList.add('copied');
      button.innerHTML = '<i class="fas fa-check"></i>';
      
      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);
    }
    
    showToast('Código NCM copiado para a área de transferência');
  } catch (err) {
    // Fallback para navegadores mais antigos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = codeToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (button) {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      }
      
      showToast('Código NCM copiado para a área de transferência');
    } catch (err2) {
      console.error('Erro ao copiar para a área de transferência:', err2);
      showToast('Erro ao copiar o código', 'error');
    }
  }
}