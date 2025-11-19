import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Code,
  Divider,
  List,
  ListItem,
} from "@chakra-ui/react";
import { chapters } from "./ChapterSelector";

// Lecture content database
const lectureContent = {
  intro: {
    0: {
      title: "What is Python?",
      description: "Learn the basics of Python programming language",
      content: (
        <VStack spacing={6} align="start">
          {/* Overview Section */}
          <Box>
            <Heading as="h3" size="md" color="blue.600" mb={3}>
              📚 What is Python?
            </Heading>
            <Text color="gray.700" lineHeight="1.8">
              Python is a high-level, interpreted programming language known for
              its simplicity and readability. Created by Guido van Rossum in
              1991, Python emphasizes code readability and allows programmers to
              express concepts in fewer lines of code than would be possible in
              languages such as C++ or Java.
            </Text>
          </Box>

          {/* Key Features */}
          <Box w="100%">
            <Heading as="h3" size="md" color="blue.600" mb={3}>
              ✨ Key Features
            </Heading>
            <List spacing={2}>
              <ListItem>
                <HStack>
                  <Text color="green.500" fontSize="lg">
                    ✓
                  </Text>
                  <Text color="gray.700">
                    <strong>Simple and Readable:</strong> Python uses
                    English-like syntax that's easy to understand
                  </Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <Text color="green.500" fontSize="lg">
                    ✓
                  </Text>
                  <Text color="gray.700">
                    <strong>Interpreted Language:</strong> No need to compile;
                    code runs directly
                  </Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <Text color="green.500" fontSize="lg">
                    ✓
                  </Text>
                  <Text color="gray.700">
                    <strong>Versatile:</strong> Used for web development, data
                    science, AI, automation, and more
                  </Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <Text color="green.500" fontSize="lg">
                    ✓
                  </Text>
                  <Text color="gray.700">
                    <strong>Large Community:</strong> Extensive libraries and
                    frameworks available
                  </Text>
                </HStack>
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* Assignment Section */}
          <Box
            w="100%"
            bg="blue.50"
            p={5}
            rounded="lg"
            borderLeft="4px solid"
            borderLeftColor="blue.500"
          >
            <HStack mb={4}>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                ASSIGNMENT
              </Badge>
              <Heading as="h3" size="sm" color="blue.700">
                Problem 1: Your First Output
              </Heading>
            </HStack>

            <VStack align="start" spacing={3}>
              <Box>
                <Heading as="h4" size="sm" color="gray.700" mb={2}>
                  📝 Problem Description
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="1.7">
                  Write a Python program that prints "Hello, Python!" to the
                  console. This is the classic first program that introduces you
                  to Python's basic output functionality.
                </Text>
              </Box>

              <Box>
                <Heading as="h4" size="sm" color="gray.700" mb={2}>
                  ✅ Expected Output
                </Heading>
                <Code
                  display="block"
                  bg="gray.800"
                  color="green.300"
                  p={3}
                  rounded="md"
                  whiteSpace="pre"
                  fontSize="sm"
                >
                  Hello, Python!
                </Code>
              </Box>

              <Box>
                <Heading as="h4" size="sm" color="gray.700" mb={2}>
                  💡 Hint
                </Heading>
                <Text color="gray.700" fontSize="sm">
                  Use the{" "}
                  <Code bg="gray.900" px={2} py={1}>
                    print()
                  </Code>{" "}
                  function to display text. The text should be enclosed in
                  quotes (either single or double).
                </Text>
              </Box>

              <Box>
                <Heading as="h4" size="sm" color="gray.700" mb={2}>
                  🔍 Why This Works
                </Heading>
                <Text color="gray.700" fontSize="sm" lineHeight="1.7" mb={2}>
                  The <Code bg="gray.900">print()</Code> function sends whatever
                  is inside the parentheses to the console, so wrapping the text
                  in quotes tells Python to treat it as a string rather than a
                  command.
                </Text>
                <Code
                  display="block"
                  bg="gray.900"
                  color="green.200"
                  p={3}
                  rounded="md"
                  whiteSpace="pre"
                  fontSize="sm"
                >
                  print("Hello, Python!")
                </Code>
              </Box>

              <Box
                w="100%"
                bg="white"
                p={4}
                rounded="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Heading as="h4" size="sm" color="gray.700" mb={3}>
                  🛠 Fix It Fast
                </Heading>
                <Text color="gray.700" fontSize="sm" mb={2}>
                  If you see an error, it usually means the text is not wrapped
                  in quotes.
                </Text>
                <VStack align="start" spacing={2} w="100%">
                  <Box w="100%">
                    <Badge colorScheme="red" mb={1}>
                      ❌ Incorrect
                    </Badge>
                    <Code
                      display="block"
                      bg="gray.900"
                      color="red.200"
                      p={3}
                      rounded="md"
                      whiteSpace="pre"
                      fontSize="sm"
                    >
                      print(Hello, Python!)
                    </Code>
                  </Box>
                  <Box w="100%">
                    <Badge colorScheme="green" mb={1}>
                      ✅ Correct
                    </Badge>
                    <Code
                      display="block"
                      bg="gray.900"
                      color="green.200"
                      p={3}
                      rounded="md"
                      whiteSpace="pre"
                      fontSize="sm"
                    >
                      print("Hello, Python!")
                    </Code>
                  </Box>
                </VStack>
              </Box>

              <Box>
                <Heading as="h4" size="sm" color="gray.700" mb={2}>
                  🎯 Learning Objectives
                </Heading>
                <List spacing={1} fontSize="sm">
                  <ListItem>
                    <HStack>
                      <Box as="span" color="blue.500">
                        →
                      </Box>
                      <Text color="gray.700">
                        Understand how to use the print() function
                      </Text>
                    </HStack>
                  </ListItem>
                  <ListItem>
                    <HStack>
                      <Box as="span" color="blue.500">
                        →
                      </Box>
                      <Text color="gray.700">Practice basic Python syntax</Text>
                    </HStack>
                  </ListItem>
                  <ListItem>
                    <HStack>
                      <Box as="span" color="blue.500">
                        →
                      </Box>
                      <Text color="gray.700">
                        Run and verify your first Python program
                      </Text>
                    </HStack>
                  </ListItem>
                </List>
              </Box>
            </VStack>
          </Box>
        </VStack>
      ),
    },
  },
};

const LectureContent = ({ chapter, lecture }) => {
  const lectureIndex = parseInt(lecture);
  const content = lectureContent[chapter]?.[lectureIndex];
  const lectureTitle = chapters[chapter]?.[lectureIndex] || "Welcome";

  console.log(
    "Chapter:",
    chapter,
    "Lecture:",
    lecture,
    "Index:",
    lectureIndex,
    "Content:",
    content
  );

  if (!content) {
    return (
      <VStack
        align="start"
        w="100%"
        h="100%"
        p={4}
        spacing={4}
        bg="gray.50"
        rounded="lg"
      >
        <Heading as="h2" size="lg" color="blue.500">
          {lectureTitle}
        </Heading>
        <Text color="gray.600">
          No content available for this lecture yet. Chapter: {chapter}, Lecture
          Index: {lectureIndex}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack align="start" w="100%" h="100%" p={4} spacing={4} overflowY="auto">
      <Box w="100%">
        <Heading as="h2" size="lg" color="blue.500" mb={2}>
          {content.title}
        </Heading>
        <Text color="gray.600" fontSize="sm">
          {content.description}
        </Text>
      </Box>
      {content.content}
    </VStack>
  );
};

export default LectureContent;
