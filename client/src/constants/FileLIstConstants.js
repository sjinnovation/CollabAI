export const retrievalFileTypes = [
  ".c",
  ".cpp",
  ".docx",
  ".html",
  ".java",
  ".json",
  ".md",
  ".pdf",
  ".php",
  ".pptx",
  ".py",
  ".rb",
  ".tex",
  ".txt",
];

export const codeInterpreterFileTypes = [
  ".c",
  ".cpp",
  ".csv",
  ".docx",
  ".html",
  ".java",
  ".json",
  ".md",
  ".pdf",
  ".php",
  ".pptx",
  ".py",
  ".rb",
  ".tex",
  ".txt",
  ".css",
  ".jpeg",
  ".jpg",
  ".js",
  ".gif",
  ".png",
  ".tar",
  ".ts",
  ".xlsx",
  ".xml",
  ".zip",
];

export const ASSISTANT_FILE_CREATION_NOTE = `Before uploading a file, enable the "Retrieval" or "Code Interpreter" option.`;

export const ASSISTANT_RETRIEVAL_NOTE = `Retrieval option supports uploading ${retrievalFileTypes.join(
  ", "
)}.`;

export const ASSISTANT_CODE_INTERPRETER_NOTE = `Code Interpreter supports uploading ${codeInterpreterFileTypes.join(
  ", "
)}.`;
