import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  Textarea,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NavBarHomePage from "../components/NavBarHomePage";

const Profile = () => {
  const {
    userData,
    backendUrl,
    setUserData,
    loadingUser,
    isLoggedin,
    authChecked,
    getUserData,
  } = useContext(AppContent);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authChecked && !isLoggedin) {
      navigate("/login");
    }
  }, [authChecked, isLoggedin, navigate]);

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setAvatarUrl(userData.avatarUrl || "");
      setBio(userData.bio || "");
      setGithubUrl(userData.githubUrl || "");
      setLinkedinUrl(userData.linkedinUrl || "");
    }
  }, [userData]);

  const completedCount = useMemo(() => {
    const progress = userData?.lectureProgress || {};
    let total = 0;
    Object.values(progress).forEach((course) => {
      Object.values(course || {}).forEach((chapterArr) => {
        total += (chapterArr || []).length;
      });
    });
    return total;
  }, [userData]);

  const handleSave = async () => {
    if (!isLoggedin) {
      toast.error("Please log in to update your profile");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/profile`,
        {
          firstName,
          lastName,
          avatarUrl,
          bio,
          githubUrl,
          linkedinUrl,
        },
        { withCredentials: true },
      );
      if (data.success) {
        setUserData(data.userData);
        getUserData();
        toast.success("Profile updated");
        setIsEditing(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if ((loadingUser || !userData) && !authChecked) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (authChecked && !isLoggedin) {
    return null;
  }

  return (
    <Box minH="100vh" bg="white">
      <NavBarHomePage logoSize={40} />
      <Box maxW="1100px" mx="auto" py={10} px={{ base: 4, md: 10 }}>
        <Heading
          textAlign="center"
          fontSize={{ base: "3xl", md: "5xl" }}
          color="#0BC8FF"
          mb={8}
          fontWeight="extrabold"
        >
          Your Profile
        </Heading>

        <Flex gap={10} direction={{ base: "column", md: "row" }}>
          <VStack
            minW={{ base: "100%", md: "280px" }}
            spacing={4}
            align="stretch"
            justify="flex-start"
          >
            <VStack spacing={3} align="center">
              <Avatar
                size="2xl"
                name={firstName || userData.name}
                src={avatarUrl || undefined}
                mx="auto"
              />
              <Button
                colorScheme="yellow"
                color="black"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </Button>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                display="none"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const nextUrl = reader.result?.toString() || "";
                      setAvatarUrl(nextUrl);
                      setUserData((prev) =>
                        prev ? { ...prev, avatarUrl: nextUrl } : prev,
                      );
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </VStack>

            <Divider />

            <VStack
              align="start"
              spacing={2}
              color="gray.600"
              fontWeight="semibold"
            >
              <HStack>
                <Text>📘</Text>
                <Text>Lessons Done: {completedCount}</Text>
              </HStack>
              <HStack>
                <Text>🏅</Text>
                <Text>Course Completed: 0</Text>
              </HStack>
            </VStack>
          </VStack>

          <Box flex="1">
            <VStack spacing={5} align="stretch">
              <FormControl isDisabled={!isEditing}>
                <FormLabel color="gray.800">First Name</FormLabel>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #60a5fa",
                  }}
                  _hover={{ borderColor: "blue.400" }}
                  _disabled={{
                    color: "black",
                    bg: "white",
                    opacity: 1,
                    borderColor: "gray.300",
                  }}
                />
              </FormControl>

              <FormControl isDisabled={!isEditing}>
                <FormLabel color="gray.800">Last Name</FormLabel>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #60a5fa",
                  }}
                  _hover={{ borderColor: "blue.400" }}
                  _disabled={{
                    color: "black",
                    bg: "white",
                    opacity: 1,
                    borderColor: "gray.300",
                  }}
                />
              </FormControl>

              <FormControl isDisabled={!isEditing}>
                <FormLabel color="gray.800">About</FormLabel>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={3}
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #60a5fa",
                  }}
                  _hover={{ borderColor: "blue.400" }}
                  _disabled={{
                    color: "black",
                    bg: "white",
                    opacity: 1,
                    borderColor: "gray.300",
                  }}
                />
              </FormControl>

              <FormControl isDisabled={!isEditing}>
                <FormLabel color="gray.800">GitHub URL</FormLabel>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #60a5fa",
                  }}
                  _hover={{ borderColor: "blue.400" }}
                  _disabled={{
                    color: "black",
                    bg: "white",
                    opacity: 1,
                    borderColor: "gray.300",
                  }}
                />
              </FormControl>

              <FormControl isDisabled={!isEditing}>
                <FormLabel color="gray.800">LinkedIn</FormLabel>
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username/"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #60a5fa",
                  }}
                  _hover={{ borderColor: "blue.400" }}
                  _disabled={{
                    color: "black",
                    bg: "white",
                    opacity: 1,
                    borderColor: "gray.300",
                  }}
                />
              </FormControl>

              <HStack justify="flex-end" spacing={3} pt={4}>
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (userData) {
                          setFirstName(userData.firstName || "");
                          setLastName(userData.lastName || "");
                          setAvatarUrl(userData.avatarUrl || "");
                          setBio(userData.bio || "");
                          setGithubUrl(userData.githubUrl || "");
                          setLinkedinUrl(userData.linkedinUrl || "");
                        }
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleSave}
                      isLoading={saving}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </HStack>
            </VStack>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default Profile;
