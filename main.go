package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

type Todo struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

var (
	todos   []Todo
	todoMux sync.Mutex
)

func main() {
	router := http.NewServeMux()
	router.HandleFunc("GET /api/todos", checkTodos)
	router.HandleFunc("POST /api/todos", createTodo)
	router.HandleFunc("PUT /api/todos/", updateTodo)
	router.HandleFunc("DELETE /api/todos/", deleteTodo)

	fmt.Println("Server listening to 8080")
	http.ListenAndServe(":8080", router)
}

func checkTodos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	todoMux.Lock()
	defer todoMux.Unlock()
	json.NewEncoder(w).Encode(todos)
}

func updateTodo(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Path[len("/api/todos/"):]
    var id int
    _, err := fmt.Sscanf(idStr, "%d", &id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    todoMux.Lock()
    defer todoMux.Unlock()
    for i, todo := range todos {
        if todo.ID == id {
            todos[i].Completed = true
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusOK)
            json.NewEncoder(w).Encode(todos[i])
            return
        }
    }
    http.Error(w, "todo not found", http.StatusNotFound)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	todo := Todo{}
	err := json.NewDecoder(r.Body).Decode(&todo)
	if err != nil || todo.Body == "" {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	todoMux.Lock()
	todo.ID = len(todos) + 1
	todos = append(todos, todo)
	todoMux.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/api/todos/"):]
    var id int
    _, err := fmt.Sscanf(idStr, "%d", &id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

	for i, todo := range todos {
        if todo.ID == id {
            deleted := todos[i] // Store the todo to return
            todos = append(todos[:i], todos[i+1:]...)
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusOK)
            json.NewEncoder(w).Encode(deleted)
            return
        }
    }
    http.Error(w, "todo not found", http.StatusNotFound)
}