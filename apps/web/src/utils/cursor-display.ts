const svgToCursor = (svg: string, x = 0, y = 0) => {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(
    svg
  )}") ${x} ${y}, auto`;
};

export const getCursor = (action: string) => {
  // Raw SVG strings
  const penSVG = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.401 16.1607L16.797 8.76472C15.5528 8.24494 14.4227 7.48592 13.471 6.53072C12.5153 5.57877 11.756 4.44837 11.236 3.20372L3.84 10.5997C3.263 11.1767 2.974 11.4657 2.726 11.7837C2.43339 12.1592 2.18226 12.5652 1.977 12.9947C1.804 13.3587 1.675 13.7467 1.417 14.5207L0.0549955 18.6037C-0.00769076 18.7907 -0.0169912 18.9914 0.0281393 19.1833C0.0732699 19.3753 0.171042 19.5508 0.310467 19.6903C0.449892 19.8297 0.625441 19.9274 0.817383 19.9726C1.00932 20.0177 1.21005 20.0084 1.397 19.9457L5.48 18.5837C6.255 18.3257 6.642 18.1967 7.006 18.0237C7.43733 17.8184 7.841 17.5687 8.217 17.2747C8.535 17.0267 8.824 16.7377 9.401 16.1607ZM18.849 6.71272C19.5864 5.97529 20.0007 4.97511 20.0007 3.93222C20.0007 2.88933 19.5864 1.88916 18.849 1.15172C18.1116 0.414286 17.1114 7.77013e-09 16.0685 0C15.0256 -7.77013e-09 14.0254 0.414286 13.288 1.15172L12.401 2.03872L12.439 2.14972C12.876 3.4005 13.5913 4.53571 14.531 5.46972C15.4929 6.43754 16.6679 7.16696 17.962 7.59972L18.849 6.71272Z" fill="#4F61E8"/>
    </svg>
  `;

  const eraserSVG = `
  <svg width="24" height="24" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.9995 13L10.9995 6.00004M20.9995 21H7.99955M10.9368 20.0628L19.6054 11.3941C20.7935 10.2061 21.3875 9.61207 21.6101 8.92709C21.8058 8.32456 21.8058 7.67551 21.6101 7.07298C21.3875 6.388 20.7935 5.79397 19.6054 4.60592L19.3937 4.39415C18.2056 3.2061 17.6116 2.61207 16.9266 2.38951C16.3241 2.19373 15.675 2.19373 15.0725 2.38951C14.3875 2.61207 13.7935 3.2061 12.6054 4.39415L4.39366 12.6059C3.20561 13.794 2.61158 14.388 2.38902 15.073C2.19324 15.6755 2.19324 16.3246 2.38902 16.9271C2.61158 17.6121 3.20561 18.2061 4.39366 19.3941L5.06229 20.0628C5.40819 20.4087 5.58114 20.5816 5.78298 20.7053C5.96192 20.815 6.15701 20.8958 6.36108 20.9448C6.59126 21 6.83585 21 7.32503 21H8.67406C9.16324 21 9.40784 21 9.63801 20.9448C9.84208 20.8958 10.0372 20.815 10.2161 20.7053C10.418 20.5816 10.5909 20.4087 10.9368 20.0628Z" stroke="#006aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
  `;

  const circleSVG = `
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667933 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#006aff"/>
</svg>

  `;

  const arrowSVG = `
   <svg width="40" height="40px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 17L17 7M17 7H8M17 7V16" stroke="#006aff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
  `;

  const textSVG = `
   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 4L10 4C11.1046 4 12 4.89543 12 6L12 18C12 19.1046 11.1046 20 10 20L9 20" stroke="#006aff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 4L14 4C12.8954 4 12 4.89543 12 6L12 18C12 19.1046 12.8954 20 14 20L15 20" stroke="#006aff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10 12H14" stroke="#006aff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
  `;
  const triangle = `
   <svg viewBox="24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C11.4477 4 11 4.44772 11 5C11 5.35894 11.1884 5.67471 11.4766 5.8524C11.6281 5.94587 11.8062 6 12 6C12.1938 6 12.3719 5.94587 12.5234 5.8524C12.8116 5.67471 13 5.35894 13 5C13 4.44772 12.5523 4 12 4ZM9 5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5C15 5.71445 14.75 6.37013 14.334 6.88471L19.3691 15.0667C19.5728 15.023 19.7839 15 20 15C21.6569 15 23 16.3431 23 18C23 19.6569 21.6569 21 20 21C18.6938 21 17.5825 20.1652 17.1707 19H6.82929C6.41746 20.1652 5.30622 21 4 21C2.34315 21 1 19.6569 1 18C1 16.3431 2.34315 15 4 15C4.21608 15 4.42723 15.023 4.63095 15.0667L9.666 6.88471C9.25004 6.37013 9 5.71445 9 5ZM11.3691 7.93333L6.334 16.1153C6.54576 16.3772 6.71451 16.6758 6.82917 17H17.1708C17.2855 16.6758 17.4542 16.3772 17.666 16.1153L12.6309 7.93333C12.4272 7.97702 12.2161 8 12 8C11.7839 8 11.5728 7.97702 11.3691 7.93333ZM4 17C3.44772 17 3 17.4477 3 18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18C5 17.6411 4.81156 17.3253 4.52344 17.1476C4.37186 17.0541 4.19378 17 4 17ZM20 17C19.8062 17 19.6281 17.0541 19.4766 17.1476C19.1884 17.3253 19 17.6411 19 18C19 18.5523 19.4477 19 20 19C20.5523 19 21 18.5523 21 18C21 17.4477 20.5523 17 20 17Z" fill="#006aff"></path> </g></svg>
  `;

  const rectangle = `
   <svg fill="#006aff" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 7.7148 49.5742 L 48.2852 49.5742 C 53.1836 49.5742 55.6446 47.1367 55.6446 42.3086 L 55.6446 13.6914 C 55.6446 8.8633 53.1836 6.4258 48.2852 6.4258 L 7.7148 6.4258 C 2.8398 6.4258 .3554 8.8398 .3554 13.6914 L .3554 42.3086 C .3554 47.1602 2.8398 49.5742 7.7148 49.5742 Z M 7.7851 45.8008 C 5.4413 45.8008 4.1288 44.5586 4.1288 42.1211 L 4.1288 13.8789 C 4.1288 11.4414 5.4413 10.1992 7.7851 10.1992 L 48.2147 10.1992 C 50.5350 10.1992 51.8708 11.4414 51.8708 13.8789 L 51.8708 42.1211 C 51.8708 44.5586 50.5350 45.8008 48.2147 45.8008 Z"></path></g></svg>
  `;

  const line = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 5C17.4477 5 17 5.44772 17 6C17 6.27642 17.1108 6.52505 17.2929 6.70711C17.475 6.88917 17.7236 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5ZM15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9C17.5372 9 17.0984 8.8948 16.7068 8.70744L8.70744 16.7068C8.8948 17.0984 9 17.5372 9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C6.46278 15 6.90157 15.1052 7.29323 15.2926L15.2926 7.29323C15.1052 6.90157 15 6.46278 15 6ZM6 17C5.44772 17 5 17.4477 5 18C5 18.5523 5.44772 19 6 19C6.55228 19 7 18.5523 7 18C7 17.7236 6.88917 17.475 6.70711 17.2929C6.52505 17.1108 6.27642 17 6 17Z" fill="#006aff"></path> </g></svg>
  `;

  const select = `
  <svg viewBox="0 0 24 24" fill="#006aff" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_429_11096)"> <path d="M11 20.9999L4 3.99994L21 10.9999L14.7353 13.6848C14.2633 13.8871 13.8872 14.2632 13.6849 14.7353L11 20.9999Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11096"> <rect width="24" height="24" fill="#ffffff"></rect> </clipPath> </defs> </g></svg>
 `;
  //  DISPLAY CURSOR BASED ON THE ACTION
  const cursors = {
    SELECT: svgToCursor(select, 10, 10),
    pen: svgToCursor(penSVG, 2, 18),
    eraser: svgToCursor(eraserSVG, 10, 10),
    circle: svgToCursor(circleSVG, 10, 10),
    arrow: svgToCursor(arrowSVG, 10, 10),
    text: svgToCursor(textSVG, 10, 10),
    triangle: svgToCursor(triangle, 10, 10),
    rectangle: svgToCursor(rectangle, 2, 12),
    line: svgToCursor(line, 10, 10),
  };

  return cursors[action as keyof typeof cursors] || "default";
};