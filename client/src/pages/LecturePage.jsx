import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import {
  ChapterSelector,
  chapters,
} from "../lecturePageSections/ChapterSelector";
import LectureSelector from "../lecturePageSections/LectureSelector";
import CodeEditor from "../lecturePageSections/CodeEditor";
import { AppContent } from "../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { CheckIcon } from "@chakra-ui/icons";

function LecturePage() {
  const [selectedChapter, setSelectedChapter] = useState("intro");
  const [selectedLecture, setSelectedLecture] = useState("0");
  const [isLectureDone, setIsLectureDone] = useState(false);
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData, backendUrl, setUserData, setIsLoggedin, getUserData } =
    useContext(AppContent);

  useEffect(() => {
    const chapterParam = searchParams.get("chapter");
    const lectureParam = searchParams.get("lecture");

    if (chapterParam && chapters[chapterParam]) {
      setSelectedChapter(chapterParam);
      const lectureIndex = parseInt(lectureParam ?? "0", 10);
      if (
        Number.isInteger(lectureIndex) &&
        lectureIndex >= 0 &&
        lectureIndex < chapters[chapterParam].length
      ) {
        setSelectedLecture(String(lectureIndex));
      } else {
        setSelectedLecture("0");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const lectureIndex = Number(selectedLecture);
    const progressData = progress?.python;
    const completed =
      progressData &&
      progressData[selectedChapter] &&
      progressData[selectedChapter].includes(lectureIndex);
    setIsLectureDone(Boolean(completed));
  }, [selectedChapter, selectedLecture, progress]);

  useEffect(() => {
    if (userData?.lectureProgress) {
      setProgress(userData.lectureProgress);
    }
  }, [userData]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/progress`, {
          withCredentials: true,
        });
        if (data.success) {
          setProgress(data.lectureProgress || {});
          setUserData((prev) =>
            prev ? { ...prev, lectureProgress: data.lectureProgress } : prev,
          );
        }
      } catch (error) {
        // silent fail; button state will rely on existing userData
      }
    };
    fetchProgress();
  }, [backendUrl, setUserData]);

  const markLectureComplete = async () => {
    if (!userData) {
      toast.error("Please log in to track your progress");
      navigate("/login");
      return;
    }
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/user/progress`,
        {
          courseId: "python",
          chapterKey: selectedChapter,
          lectureIndex: Number(selectedLecture),
        },
        { withCredentials: true },
      );

      if (data.success) {
        setUserData((prev) =>
          prev
            ? { ...prev, lectureProgress: data.lectureProgress }
            : { lectureProgress: data.lectureProgress },
        );
        setProgress(data.lectureProgress);
        getUserData();
        setIsLectureDone(true);
        toast.success("Lecture marked as completed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to mark lecture";
      toast.error(message);
    }
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
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
              cursor="pointer"
              onClick={() => navigate("/dashboard")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/dashboard");
              }}
            >
              Py
            </Box>
            <Heading as="h1" size="lg" color="gray.800" whiteSpace="nowrap">
              Python
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
            <Button
              colorScheme={isLectureDone ? "green" : "blue"}
              variant={isLectureDone ? "solid" : "outline"}
              leftIcon={isLectureDone ? <CheckIcon /> : undefined}
              onClick={markLectureComplete}
            >
              {isLectureDone ? "Completed" : "Mark as Done"}
            </Button>
            {userData ? (
              <Box position="relative" role="group">
                <Flex
                  w={10}
                  h={10}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="yellow.500"
                  color="white"
                  fontWeight="bold"
                  cursor="pointer"
                >
                  {userData.avatarUrl ? (
                    <Box w="100%" h="100%" overflow="hidden" rounded="full">
                      <Image
                        src={userData.avatarUrl}
                        alt="User avatar"
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                    </Box>
                  ) : (
                    <Text>
                      {userData.name ? userData.name[0].toUpperCase() : "U"}
                    </Text>
                  )}
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
                    onClick={() => navigate("/profile")}
                  >
                    Profile
                  </Box>
                  <Box
                    as="li"
                    px={3}
                    py={1}
                    cursor="pointer"
                    _hover={{ bg: "gray.200" }}
                    whiteSpace="nowrap"
                    color="black"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </Box>
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
                  <Image src={assets.arrow_icon} alt="Arrow icon" boxSize={4} />
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
