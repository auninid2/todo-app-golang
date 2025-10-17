import { VStack, Text, Box, useColorModeValue } from "@chakra-ui/react";
import TodoItem from "./TodoItem";

const TodoList = ({ todos, onUpdateTodo, onDeleteTodo }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Add null/undefined check
  if (!todos || !Array.isArray(todos) || todos.length === 0) {
    return (
      <Box
        p={6}
        bg={cardBg}
        borderRadius="lg"
        shadow="md"
        textAlign="center"
        border="1px"
        borderColor={borderColor}
      >
        <Text color="gray.500" fontSize="lg">
          No todos yet. Add one above!
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          onUpdate={onUpdateTodo}
          onDelete={onDeleteTodo}
        />
      ))}
    </VStack>
  );
};

export default TodoList;
