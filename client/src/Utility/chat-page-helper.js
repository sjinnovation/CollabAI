import { v4 as uuidv4 } from "uuid";

export const getItemsFromIds = (itemList, idList) => {
  const items = [];
  idList.forEach((id) => {
    const item = itemList?.find((item) => item._id === id);
    items.push(item);
  });
  return items;
};


export const getIdsFromItems = (itemList) => {
  const idList = [];
  itemList.forEach((item) => {
    idList.push(item._id);
  });
  return idList;
};

export const inputElementAutoGrow = (element) => {
  element.style.height = "5px";
  element.style.height = element.scrollHeight + "px";
};


export const generateThreadId = () => {
  const newThreadId = uuidv4();

  return newThreadId;
}

export const scrollToBottomForRefElement = (ref) => {
  if (ref.current) {
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }
};