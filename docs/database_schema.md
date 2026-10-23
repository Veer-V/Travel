# SmartVoyage AI — Database Design & Entity Relationship

## 1. Relational Schema Architecture

The database follows a normalized relational structure designed for transactional consistency, rich spatial and metadata queries, and high read throughput for travel recommendations and itineraries.

```mermaid
erDiagram
    USERS ||--o{ TRIPS : owns
    USERS ||--o{ USER_PREFERENCES : configures
    USERS ||--o{ SAVED_PLACES : bookmarks
    
    DESTINATIONS ||--o{ ATTRACTIONS : contains
    DESTINATIONS ||--o{ ACCOMMODATIONS : contains
    DESTINATIONS ||--o{ RESTAURANTS : contains
    DESTINATIONS ||--o{ SAFETY_OBSERVATIONS : monitors
    DESTINATIONS ||--o{ OFFICIAL_ADVISORIES : alerts
    DESTINATIONS ||--o{ TRIPS : targets
    
    TRIPS ||--o{ ITINERARIES : organizes
    TRIPS ||--o{ EXPENSES : incurs
    
    ITINERARIES ||--o{ ITINERARY_ITEMS : schedules
    ATTRACTIONS ||--o{ ITINERARY_ITEMS : referenced_in
    RESTAURANTS ||--o{ ITINERARY_ITEMS : referenced_in

    USERS {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    DESTINATIONS {
        int id PK
        string name
        string state_or_region
        string country
        float latitude
        float longitude
        string destination_type
        text description
        string best_time_to_visit
        string climate
        string source
        timestamp last_updated
    }

    ATTRACTIONS {
        int id PK
        int destination_id FK
        string name
        string category
        float latitude
        float longitude
        int estimated_visit_duration
        float admission_price
        string opening_hours
        float rating
        string accessibility_features
        text description
        string source
        timestamp last_updated
    }

    ACCOMMODATIONS {
        int id PK
        int destination_id FK
        string name
        string accommodation_type
        float latitude
        float longitude
        float price_per_night
        string amenities
        float rating
        string booking_url
        string source
        timestamp last_updated
    }

    RESTAURANTS {
        int id PK
        int destination_id FK
        string name
        string cuisine
        float latitude
        float longitude
        string price_level
        string dietary_options
        float rating
        string opening_hours
        string source
        timestamp last_updated
    }

    TRIPS {
        uuid id PK
        uuid user_id FK
        int destination_id FK
        string title
        string origin
        date start_date
        date end_date
        int total_days
        int num_travelers
        float total_budget
        string currency
        string travel_style
        string transport_preference
        string accommodation_preference
        string food_preference
        string accessibility_requirements
        string status
        timestamp created_at
        timestamp updated_at
    }

    ITINERARIES {
        uuid id PK
        uuid trip_id FK
        int day_number
        date date
        float daily_expense_estimate
        text notes
    }

    ITINERARY_ITEMS {
        uuid id PK
        uuid itinerary_id FK
        int attraction_id FK
        int restaurant_id FK
        string time_slot
        string start_time
        string end_time
        string activity_name
        string activity_type
        string location_name
        float latitude
        float longitude
        string travel_mode
        int travel_duration_minutes
        int visit_duration_minutes
        float estimated_cost
        boolean booking_required
        string data_source
        int order_index
    }

    EXPENSES {
        uuid id PK
        uuid trip_id FK
        string category
        float amount
        string currency
        string description
        date date
        boolean is_actual
    }

    SAFETY_OBSERVATIONS {
        int id PK
        int destination_id FK
        date observation_date
        string geographic_area
        string incident_category
        int incident_count
        int exposure_denominator
        string weather_hazard
        string infrastructure_indicators
        string official_advisory_level
        string data_source
        string data_quality_flag
        timestamp last_updated
    }

    OFFICIAL_ADVISORIES {
        int id PK
        int destination_id FK
        string advisory_level
        text advisory_text
        date issued_date
        string source_organization
        string source_url
        timestamp last_updated
    }
```
