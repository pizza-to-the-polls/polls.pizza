const scrollPageToTop = () => {
  if (window) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
export default scrollPageToTop;
