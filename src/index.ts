import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const printButton = document.querySelector('[ns-printonpage-element="button"]');
  const printTargets = document.querySelectorAll('[ns-printonpage-element="target"]');
  const documentTitleElement = document.querySelector('[ns-printonpage-title]');
  let documentTitle: string;

  if (documentTitleElement) {
    documentTitle = documentTitleElement.getAttribute('ns-printonpage-title') || '';
  } else {
    documentTitle = document.title;
  }

  // Function to generate PDF from multiple targets
  async function generatePdf() {
    const pdf = new jsPDF('p', 'pt', 'a4');
    if (printButton) printButton.textContent = 'Téléchargement en cours...';

    for (const target of printTargets) {
      const wrapper = document.createElement('div');
      wrapper.style.padding = '96px';
      const titleElement = document.createElement('h1');
      titleElement.textContent = documentTitle;
      titleElement.style.fontSize = '24px';
      wrapper.appendChild(titleElement);

      const dateElement = document.createElement('p');
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString();
      dateElement.textContent = `Date: ${formattedDate}`;
      dateElement.style.paddingBottom = '48px';
      wrapper.appendChild(dateElement);

      // Clone target to avoid modifying the original DOM
      const clonedTarget = target.cloneNode(true);
      wrapper.appendChild(clonedTarget);

      // Use a detached element to avoid modifying the current DOM
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, { useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 595.28;
      const pageHeight = 841.89;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up the detached wrapper
      document.body.removeChild(wrapper);
    }

    pdf.save(`${documentTitle}.pdf`);
    if (printButton) printButton.textContent = 'PDF téléchargé !';
  }

  if (printButton) {
    printButton.addEventListener('click', () => {
      generatePdf();
    });
  }
});
