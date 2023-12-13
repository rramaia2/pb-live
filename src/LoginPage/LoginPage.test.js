import React from 'react';
import { shallow } from 'enzyme';
import LoginPage from './LoginPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

it('renders without crashing', () => {
  const wrapper = shallow(<LoginPage />);
  expect(wrapper).toBeTruthy();
});

it('contains the login form', () => {
  const wrapper = shallow(<LoginPage />);
  const form = wrapper.find('form');
  expect(form).toHaveLength(1);
});

it('displays the correct heading', () => {
  const wrapper = shallow(<LoginPage />);
  const headingText = wrapper.find('h2').text();
  expect(headingText).toEqual('Login Page');
});

it('contains input fields for username and password', () => {
  const wrapper = shallow(<LoginPage />);
  const usernameInput = wrapper.find('input[placeholder="Username"]');
  const passwordInput = wrapper.find('input[placeholder="Password"]');
  expect(usernameInput).toHaveLength(1);
  expect(passwordInput).toHaveLength(1);
});
