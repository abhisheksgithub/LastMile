package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

var fileContent []byte

type InventoryData struct {
	Id                 int      `json:"id"`
	Name               string   `json:"name"`
	Username           string   `json:"username"`
	Email              string   `json:"email"`
	Delivered          bool     `json:"delivered"`
	Phone              string   `json:"phone"`
	Website            string   `json:"website"`
	DeliveryComments   string   `json:"deliveryComments"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	Price              int      `json:"price"`
	DiscountPercentage float64  `json:"discountPercentage"`
	Rating             float64  `json:"rating"`
	Stock              int      `json:"stock"`
	Brand              string   `json:"brand"`
	Category           string   `json:"category"`
	Thumbnail          string   `json:"thumbnail"`
	Images             []string `json:"images"`
}

func userPayloadHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		w.Header().Set("Content-Type", "text/plain; charset:utf-8;")
		r.ParseForm()
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Fatal(err)
		}
		invData := []InventoryData{}
		err = json.Unmarshal(body, &invData)
		if err != nil {
			log.Fatal("Error mapping JSON object", err)
		}
		fileContent, err = json.Marshal(invData)
		if err != nil {
			log.Fatal("Error converting to bytes", err)
		}
		// fmt.Println(invData)
	case "GET":
		w.Header().Set("Content-Type", "application/json; charset:utf-8;")
		// bytes.NewBuffer()
		w.Write(fileContent)
	}
}

func main() {
	// CORS being set
	corsMiddleWare := cors.Default()
	fileContent = []byte{}
	f, err := os.Open("./stubData/users.json")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	byteValue, errF := io.ReadAll(f)
	if errF != nil {
		log.Fatal(errF)
	}
	fileContent = byteValue
	http.Handle("/users", corsMiddleWare.Handler(http.HandlerFunc(userPayloadHandler)))
	// http.HandleFunc("/users", userPayloadHandler)
	http.ListenAndServe(":8080", nil)
}
