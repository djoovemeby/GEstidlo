Feature: Health Check
  In order to ensure the API is running
  I want to check the health status

  Scenario: Service is up and running
    When I request the health status
    Then the response status should be 200
    And the status should be "UP"
