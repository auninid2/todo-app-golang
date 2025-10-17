import {
  Box,
  HStack,
  Text,
  Checkbox,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon, DeleteIcon } from "@chakra-ui/icons";

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const completedBorderColor = useColorModeValue("green.400", "green.300");
  const activeBorderColor = useColorModeValue("blue.400", "blue.300");

  const handleComplete = () => {
    if (!todo.completed) {
      onUpdate(todo._id);
    }
  };

  const handleDelete = () => {
    onDelete(todo._id);
  };

  return (
    <Box
      p={4}
      bg={cardBg}
      borderRadius="lg"
      shadow="md"
      borderLeft="4px solid"
      borderLeftColor={
        todo.completed ? completedBorderColor : activeBorderColor
      }
      border="1px"
      borderColor={borderColor}
    >
      <HStack justify="space-between" align="flex-start">
        <HStack spacing={3} align="flex-start" flex={1}>
          <Checkbox
            isChecked={todo.completed}
            onChange={handleComplete}
            colorScheme="green"
            size="lg"
            mt={1}
            isDisabled={todo.completed}
          />
          <Text
            flex={1}
            fontSize="lg"
            textDecoration={todo.completed ? "line-through" : "none"}
            color={todo.completed ? "gray.500" : "inherit"}
          >
            {todo.body}
          </Text>
        </HStack>

        <HStack spacing={2}>
          {!todo.completed && (
            <IconButton
              icon={<CheckIcon />}
              colorScheme="green"
              size="sm"
              onClick={handleComplete}
              aria-label="Mark as completed"
            />
          )}
          <IconButton
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            onClick={handleDelete}
            aria-label="Delete todo"
          />
        </HStack>
      </HStack>
    </Box>
  );
};

export default TodoItem;
