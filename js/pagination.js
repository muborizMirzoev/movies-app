export const pageNumbers = (total, max, current) => {
   const half = Math.floor(max / 2);
   let to = max;

   if (current + half >= total) {
      to = total;
   } else if (current > half) {
      to = current + half;
   }

   let from = to - max;
   return Array.from({length: max}, (_, i) => (i + 1) + from);
}

export function PaginationButton(totalPages, maxPagesVisible = 10, currentPage = 1) {

   let pages = pageNumbers(totalPages, maxPagesVisible, currentPage);
   let currentPageBtn = null;
   const buttons = new Map();
   const disabled = {
      start: () => pages[0] === 1,
      prev: () => currentPage === 1,
      end: () => pages.slice(-1)[0] === totalPages,
      next: () => currentPage === totalPages
   }
   const frag = document.createDocumentFragment();
   const paginationButtonContainer = document.createElement('div');
   paginationButtonContainer.className = 'pagination-buttons';

   const createAndSetupButton = (label = '', cls = '', disabled = false, handleClick) => {
      const buttonElement = document.createElement('button');
      buttonElement.textContent = label;
      buttonElement.className = `page-btn ${cls}`;
      buttonElement.disabled = disabled;
      buttonElement.addEventListener('click', e => {
         handleClick(e);
         this.update();
         paginationButtonContainer.value = currentPage;
         paginationButtonContainer.dispatchEvent(new Event('change'));
      });

      return buttonElement;
   }

   const onPageButtonClick = e => currentPage = Number(e.currentTarget.textContent);

   const onPageButtonUpdate = index => (btn) => {
      btn.textContent = pages[index];

      if (pages[index] === currentPage) {
         currentPageBtn.classList.remove('active');
         btn.classList.add('active');
         currentPageBtn = btn;
         currentPageBtn.focus();
      }
   };

   buttons.set(
      createAndSetupButton('start', 'start-page', disabled.start(), () => currentPage = 1),
      (btn) => btn.disabled = disabled.start()
   )

   buttons.set(
      createAndSetupButton('prev', 'prev-page', disabled.prev(), () => currentPage -= 1),
      (btn) => btn.disabled = disabled.prev()
   )

   pages.map((pageNumber, index) => {
      const isCurrentPage = currentPage === pageNumber;
      const button = createAndSetupButton(
         pageNumber, isCurrentPage ? 'active' : '', false, onPageButtonClick
      );

      if (isCurrentPage) {
         currentPageBtn = button;
      }

      buttons.set(button, onPageButtonUpdate(index));
   });

   buttons.set(
      createAndSetupButton('next', 'next-page', disabled.next(), () => currentPage += 1),
      (btn) => btn.disabled = disabled.next()
   )

   buttons.set(
      createAndSetupButton('end', 'end-page', disabled.end(), () => currentPage = totalPages),
      (btn) => btn.disabled = disabled.end()
   )

   buttons.forEach((_, btn) => frag.append(btn));
   paginationButtonContainer.append(frag);

   this.render = (container = document.querySelector('.pagination__wrapper')) => {
      container.innerHTML = '';
      container.append(paginationButtonContainer);
   }

   this.update = (newPageNumber = currentPage) => {
      currentPage = newPageNumber;
      pages = pageNumbers(totalPages, maxPagesVisible, currentPage);
      buttons.forEach((updateButton, btn) => updateButton(btn));
   }

   this.onChange = (handler) => {
      paginationButtonContainer.addEventListener('change', handler);
   }
}

