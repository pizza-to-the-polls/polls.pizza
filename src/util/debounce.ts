// Debounce function for back-to-top scroll event
const debounce = <A extends unknown[]>(func: (...args: A) => void, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: A): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced;
};
export default debounce;
