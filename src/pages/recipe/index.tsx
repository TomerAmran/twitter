import { ChatBot } from "./getAnswer";
import ChatComponent from "./chatComponent";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const Home = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatComponent />
    </QueryClientProvider>
  );
};

export default Home;
