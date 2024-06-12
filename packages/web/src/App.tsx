import axios from "axios";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    axios
      .get("http://localhost:3000")  // ローカルのバックエンドサーバーのURLにgetメソッドでアクセス
      .then((response) => {
        console.log(response.data.message)
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, []);

  return <div></div>;
}