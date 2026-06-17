import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/index";

jest.mock("./utility/productApi", () => ({
  fetchProducts: jest.fn(() => Promise.resolve([])),
}));

test("renders app header", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>
  );

  const matches = await screen.findAllByText(/HOMELY Meals/i);
  expect(matches.length).toBeGreaterThan(0);
});
