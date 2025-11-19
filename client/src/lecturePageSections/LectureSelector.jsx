import { Box, Button, Flex, Select, Text } from "@chakra-ui/react";
import { chapters } from "./ChapterSelector";

const LectureSelector = ({
  selectedChapter,
  selectedLecture,
  onLectureChange,
  onPrevLecture,
  onNextLecture,
}) => {
  const lectures = chapters[selectedChapter] || [];
  const currentIndex = parseInt(selectedLecture);
  const maxIndex = lectures.length - 1;

  return (
    <Flex align="center" gap={3}>
      <Select
        size="sm"
        value={selectedLecture}
        onChange={(e) => onLectureChange(e.target.value)}
        borderColor="gray.300"
        minW="300px"
        color="gray.800"
        bg="white"
        _focus={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #0ea5e9",
        }}
      >
        {lectures.map((lecture, index) => (
          <option key={index} value={index}>
            Lecture {index + 1}: {lecture}
          </option>
        ))}
      </Select>

      <Button
        size="sm"
        bg="yellow.400"
        color="black"
        _hover={{ bg: "yellow.500" }}
        onClick={onPrevLecture}
        isDisabled={currentIndex === 0}
        flexShrink={0}
      >
        ←
      </Button>

      <Button
        size="sm"
        bg="blue.500"
        color="white"
        _hover={{ bg: "blue.600" }}
        onClick={onNextLecture}
        isDisabled={currentIndex === maxIndex}
        flexShrink={0}
      >
        →
      </Button>
    </Flex>
  );
};

export default LectureSelector;
