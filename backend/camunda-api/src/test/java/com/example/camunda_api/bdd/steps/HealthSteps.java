package com.example.camunda_api.bdd.steps;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@CucumberContextConfiguration
@SpringBootTest
@AutoConfigureMockMvc
public class HealthSteps {

    @Autowired
    private MockMvc mockMvc;

    private ResultActions resultActions;

    @When("I request the health status")
    public void iRequestTheHealthStatus() throws Exception {
        resultActions = mockMvc.perform(get("/actuator/health"));
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int statusCode) throws Exception {
        resultActions.andExpect(status().is(statusCode));
    }

    @Then("the status should be {string}")
    public void theStatusShouldBe(String statusValue) throws Exception {
        resultActions.andExpect(jsonPath("$.status").value(statusValue));
    }
}
