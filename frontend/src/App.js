import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Input,
  Button,
  Spinner,
  Center,
  Text,
  useToast,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { todoAPI } from "./services/api";
import TodoList from "./components/TodoList";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setError(null);
      const response = await todoAPI.getTodos();
      setTodos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMessage = "Failed to fetch todos";
      setError(errorMessage);
      toast({
        title: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setError(null);
      const response = await todoAPI.createTodo(newTodo);
      setTodos((prevTodos) => [...prevTodos, response.data]);
      setNewTodo("");
      toast({
        title: "Todo created successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      const errorMessage = "Error creating todo";
      setError(errorMessage);
      toast({
        title: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTodo = async (id) => {
    try {
      setError(null);
      await todoAPI.updateTodo(id);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === id ? { ...todo, completed: true } : todo
        )
      );
      toast({
        title: "Todo marked as completed",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      const errorMessage = "Error updating todo";
      setError(errorMessage);
      toast({
        title: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setError(null);
      await todoAPI.deleteTodo(id);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
      toast({
        title: "Todo deleted successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      const errorMessage = "Error deleting todo";
      setError(errorMessage);
      toast({
        title: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading textAlign="center" color="blue.500">
              Todo App
            </Heading>
            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="lg"
            />
          </Box>

          {error && (
            <Box
              p={4}
              bg="red.100"
              color="red.700"
              borderRadius="md"
              borderLeft="4px solid"
              borderColor="red.500"
            >
              <Text fontWeight="bold">{error}</Text>
              <Button
                mt={2}
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={fetchTodos}
              >
                Retry
              </Button>
            </Box>
          )}

          <Box
            as="form"
            onSubmit={handleCreateTodo}
            p={6}
            bg={cardBg}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={4}>
              <Input
                placeholder="What needs to be done?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                size="lg"
                bg={cardBg}
              />
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isDisabled={!newTodo.trim()}
              >
                Add Todo
              </Button>
            </VStack>
          </Box>

          <TodoList
            todos={todos}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
