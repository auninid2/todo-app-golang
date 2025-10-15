package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID        primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

var collection *mongo.Collection

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Failed loading .env file", err)
	}

	MONGODB_URI := os.Getenv("MONGODB_URI")
	clientOptions := options.Client().ApplyURI(MONGODB_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	defer client.Disconnect(context.Background())

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully connected to the database")	

	collection = client.Database("golang_db").Collection("todos")

	router := http.NewServeMux()
	router.HandleFunc("GET /api/todos", checkTodos)
	router.HandleFunc("POST /api/todos", createTodo)
	router.HandleFunc("PUT /api/todos/", updateTodo)
	router.HandleFunc("DELETE /api/todos/", deleteTodo)

	fmt.Println("Server listening to 8080")
	http.ListenAndServe(":8080", router)
}

func checkTodos(w http.ResponseWriter, r *http.Request) {
    var todos []Todo

    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        http.Error(w, "Failed to fetch todos", http.StatusInternalServerError)
        return
    }
    defer cursor.Close(context.Background())

    for cursor.Next(context.Background()) {
        var todo Todo
        if err := cursor.Decode(&todo); err != nil {
            http.Error(w, "Failed to decode todo", http.StatusInternalServerError)
            return
        }
        todos = append(todos, todo)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(todos)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
    var todo Todo
    if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    if todo.Body == "" {
        http.Error(w, "Todo body is required", http.StatusBadRequest)
        return
    }

    todo.Completed = false 
    insertResult, err := collection.InsertOne(context.Background(), todo)
    if err != nil {
        http.Error(w, "Failed to create todo", http.StatusInternalServerError)
        return
    }

    todo.ID = insertResult.InsertedID.(primitive.ObjectID)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(todo)
}

func updateTodo(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Path[len("/api/todos/"):]
    if id == "" {
        http.Error(w, "Missing ID", http.StatusBadRequest)
        return
    }
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    filter := bson.M{"_id": objectID}
    update := bson.M{"$set": bson.M{"completed": true}}

    _, err = collection.UpdateOne(context.Background(), filter, update)
    if err != nil {
        http.Error(w, "Failed to update todo", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Path[len("/api/todos/"):]
    if id == "" {
        http.Error(w, "Missing ID", http.StatusBadRequest)
        return
    }
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    filter := bson.M{"_id": objectID}
    result, err := collection.DeleteOne(context.Background(), filter)
    if err != nil {
        http.Error(w, "Failed to delete todo", http.StatusInternalServerError)
        return
    }
    if result.DeletedCount == 0 {
        http.Error(w, "Todo not found", http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}