const scrollPageToTop = () => {
  if (window) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
export default scrollPageToTop;
