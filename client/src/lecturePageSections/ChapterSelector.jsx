import { Box, Select, Text } from "@chakra-ui/react";

export const chapters = {
  intro: ["What is Python?", "Why Learn Python?", "History of Python"],
  setup: ["Installing Python", "Setting Up VS Code"],
  basics: ["Hello World", "Variables", "Data Types"],
  datatypes: ["Strings", "Lists", "Dictionaries"],
  control: ["If Statements", "Loops"],
  functions: ["Defining Functions", "Arguments & Returns"],
  modules: ["Importing Modules", "Using pip"],
  files: ["Reading Files", "Writing Files"],
  oop: ["Classes & Objects", "Inheritance"],
  libraries: ["NumPy", "Pandas", "Flask"],
  next: ["Building Projects"],
};

export const chapterOptions = {
  intro: "Introduction",
  setup: "Setup & Installation",
  basics: "Python Basics",
  datatypes: "Data Types",
  control: "Control Flow",
  functions: "Functions",
  modules: "Modules & Packages",
  files: "File I/O",
  oop: "OOP",
  libraries: "Popular Libraries",
  next: "Next Steps",
};

export const ChapterSelector = ({ selectedChapter, onChapterChange }) => {
  return (
    <Select
      size="sm"
      value={selectedChapter}
      onChange={(e) => onChapterChange(e.target.value)}
      borderColor="blue.500"
      borderWidth="2px"
      minW="200px"
      maxW="300px"
      color="gray.800"
      bg="white"
      _focus={{
        borderColor: "blue.500",
        boxShadow: "0 0 0 1px #0ea5e9",
      }}
    >
      {Object.entries(chapterOptions).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  );
};

export default ChapterSelector;
