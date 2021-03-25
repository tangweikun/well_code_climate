import { useWindowSize } from 'hooks';

// FIXME: 参数多个
// interface IUseSize {
//   (width: number, height: number): { width: number; height: number };
// }

export const useSize = (width: number = 0, height: number = 0) => {
  const { screenWidth, screenHeight } = useWindowSize();
  let widthRatio = screenWidth / 1600;
  let heightRatio = screenHeight / 800;

  return { width: Math.ceil(widthRatio * width), height: Math.ceil(heightRatio * height) };
};
