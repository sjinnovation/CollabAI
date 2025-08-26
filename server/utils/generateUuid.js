import { v4 as uuidv4 } from 'uuid';
export const generateThreadId = () => {
  const newThreadId = uuidv4();

  return newThreadId;
}