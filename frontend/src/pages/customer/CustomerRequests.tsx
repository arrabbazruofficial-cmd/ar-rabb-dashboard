import MyRequests from '../agency/MyRequests';

export default function CustomerRequests() {
  return <MyRequests />; // Reuse the exact same component, the API automatically filters by user.role
}
