import { useEffect, useId, useRef, useState } from "react";
import { Box, Button, Text, Textarea, useToast } from "@chakra-ui/react";
import { executeCode } from "../constants/api";

const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const stdinId = useId();
  const activeRun = useRef(null);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    return () => {
      activeRun.current?.abort();
      activeRun.current = null;
    };
  }, []);

  const runCode = async () => {
    if (activeRun.current) return;
    const sourceCode = editorRef?.current?.getValue();
    if (!sourceCode?.trim()) {
      setOutput("Enter some code in the editor before running it.");
      setIsError(false);
      return;
    }

    const controller = new AbortController();
    activeRun.current = controller;
    setIsLoading(true);
    setIsError(false);
    setOutput(null);
    try {
      const { run: result } = await executeCode(language, sourceCode, stdin, {
        signal: controller.signal,
      });
      if (activeRun.current !== controller || controller.signal.aborted) return;
      if (!result) throw new Error("The code runner returned no execution result.");

      const hasError = Boolean(result.stderr) ||
        (result.code != null && Number(result.code) !== 0);
      const resultOutput = result.output ??
        `${result.stdout || ""}${result.stderr || ""}`;
      setOutput(resultOutput || (hasError
        ? `Execution failed${result.code != null ? ` (exit code ${result.code})` : ""}.`
        : "Code finished successfully with no output."));
      setIsError(hasError);
    } catch (error) {
      if (activeRun.current !== controller || controller.signal.aborted) return;
      const message = error.message || "Unable to run code. Please try again.";
      setOutput(message);
      setIsError(true);
      toast({
        title: "Unable to run code.",
        description: message,
        status: "error",
        duration: 6000,
      });
    } finally {
      if (activeRun.current === controller) {
        activeRun.current = null;
        setIsLoading(false);
      }
    }
  };

  const stopCode = () => {
    activeRun.current?.abort();
    activeRun.current = null;
    setIsLoading(false);
    setIsError(false);
    setOutput("Execution stopped.");
  };

  return (
    <Box w="100%" h="100%" display="flex" flexDirection="column" p={2} overflowY="auto">
      <Box display="flex" alignItems="center" gap={2} mb={2} flexShrink={0}>
        <Text fontSize="md" flex={1}>Output</Text>
        <Button
          size="sm"
          variant="outline"
          colorScheme="green"
          isLoading={isLoading}
          loadingText="Running"
          onClick={runCode}
        >
          Run Code
        </Button>
        {isLoading && (
          <Button size="sm" variant="outline" colorScheme="red" onClick={stopCode}>
            Stop
          </Button>
        )}
      </Box>
      <Box as="details" mb={2} flexShrink={0}>
        <Box as="summary" id={stdinId} cursor="pointer" fontSize="sm" color="gray.400">
          Standard input (optional)
        </Box>
        <Textarea
          aria-labelledby={stdinId}
          value={stdin}
          onChange={(event) => setStdin(event.target.value)}
          placeholder="Enter one input value per line for input() or stdin"
          fontFamily="mono"
          fontSize="sm"
          rows={2}
          minH="60px"
          mt={2}
          isDisabled={isLoading}
        />
      </Box>
      <Box
        flex={1}
        minH="64px"
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
        overflowY="auto"
        w="100%"
        role={isError ? "alert" : "status"}
        aria-busy={isLoading}
      >
        {output !== null ? (
          <Text as="pre" fontFamily="mono" fontSize="sm" whiteSpace="pre-wrap" overflowWrap="anywhere" m={0}>
            {output}
          </Text>
        ) : (
          <Text fontSize="sm" color="gray.400">
            {isLoading ? "Running your code…" : 'Click "Run Code" to see the output here'}
          </Text>
        )}
      </Box>
    </Box>
  );
};
export default Output;
