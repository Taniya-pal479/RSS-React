export const BuggyComponent = () => {
  // Yeh line error throw karegi jab component render hoga
  throw new Error("I crashed! 💥");
  return null; 
};