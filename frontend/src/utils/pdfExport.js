import html2pdf from 'html2pdf.js';

/**
 * Export the trip itinerary as a downloadable PDF.
 * @param {string} elementId - The ID of the DOM element to capture
 * @param {string} filename - The name for the downloaded PDF file
 */
export const exportToPDF = async (elementId, filename = 'trip-itinerary.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('PDF export: element not found');
    return;
  }

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export PDF');
  }
};
