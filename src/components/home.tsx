import { Link } from "react-router-dom"


const Home = () => {
  return (
    <div className="w-full h-screen">
        <nav className="flex flex-col items-center justify-center h-full space-y-4">
            <Link to="/canteen" className="text-blue-500 hover:underline text-lg">Canteen</Link>
            <Link to="/residence" className="text-blue-500 hover:underline text-lg">Residence</Link>
            <Link to="/contact" className="text-blue-500 hover:underline text-lg">Contact</Link>
 
        </nav>
    </div>
  )
}

export default Home