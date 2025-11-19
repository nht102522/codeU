import { useContext, useState } from "react";
import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import {
  ChapterSelector,
  chapters,
} from "../lecturePageSections/ChapterSelector";
import LectureSelector from "../lecturePageSections/LectureSelector";
import CodeEditor from "../lecturePageSections/CodeEditor";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

function LecturePage() {
  const [selectedChapter, setSelectedChapter] = useState("intro");
  const [selectedLecture, setSelectedLecture] = useState("0");
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContent);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePrevLecture = () => {
    const current = parseInt(selectedLecture);
    if (current > 0) {
      setSelectedLecture(String(current - 1));
    }
  };

  const handleNextLecture = () => {
    const current = parseInt(selectedLecture);
    const maxIndex = chapters[selectedChapter].length - 1;
    if (current < maxIndex) {
      setSelectedLecture(String(current + 1));
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Combined Header and Navigation Bar */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        py={4}
        px={6}
      >
        <Flex
          maxW="100%"
          mx="auto"
          align="center"
          justify="space-between"
          gap={6}
        >
          {/* Logo and Title - Left Side */}
          <Flex align="center" gap={3} flexShrink={0}>
            <Box
              w={10}
              h={10}
              rounded="md"
              bg="blue.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="bold"
            >
              Py
            </Box>
            <Heading as="h1" size="lg" color="gray.800" whiteSpace="nowrap">
              Introduction to Python
            </Heading>
          </Flex>

          {/* Chapter and Lecture Selectors - Right Side */}
          <Flex gap={4} align="center" flex={1} justify="flex-end">
            <ChapterSelector
              selectedChapter={selectedChapter}
              onChapterChange={(chapter) => {
                setSelectedChapter(chapter);
                setSelectedLecture("0");
              }}
            />
            <LectureSelector
              selectedChapter={selectedChapter}
              selectedLecture={selectedLecture}
              onLectureChange={setSelectedLecture}
              onPrevLecture={handlePrevLecture}
              onNextLecture={handleNextLecture}
            />
            {userData ? (
              <Box position="relative" role="group">
                <Flex
                  w={8}
                  h={8}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="yellow.500"
                  color="white"
                  fontWeight="bold"
                  cursor="pointer"
                >
                  <Text>
                    {userData.name
                      ? userData.name[0].toUpperCase()
                      : "U"}
                  </Text>
                </Flex>
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  pt={10}
                  zIndex={10}
                  display="none"
                  _groupHover={{ display: "block" }}
                >
                  <Box
                    bg="gray.100"
                    rounded="md"
                    boxShadow="md"
                    as="ul"
                    listStyleType="none"
                    m={0}
                    p={2}
                  >
                    {!userData.isAccountVerified && (
                      <Box
                        as="li"
                        px={3}
                        py={1}
                        cursor="pointer"
                        _hover={{ bg: "gray.200" }}
                        whiteSpace="nowrap"
                        onClick={sendVerificationOtp}
                      >
                        Verify email
                      </Box>
                    )}
                    <Box
                      as="li"
                      px={3}
                      py={1}
                      cursor="pointer"
                      _hover={{ bg: "gray.200" }}
                      whiteSpace="nowrap"
                      color="black"
                      onClick={logout}
                    >
                      Logout
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Button
                variant="outline"
                borderRadius="full"
                px={5}
                colorScheme="gray"
                onClick={() => navigate("/login")}
                rightIcon={
                  <Image
                    src={assets.arrow_icon}
                    alt="Arrow icon"
                    boxSize={4}
                  />
                }
              >
                Login
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box
        minH="calc(100vh - 200px)"
        bg="#0f0a19"
        color="gray.500"
        px={6}
        py={8}
      >
        <CodeEditor chapter={selectedChapter} lecture={selectedLecture} />
      </Box>
    </Box>
  );
}

export default LecturePage;
