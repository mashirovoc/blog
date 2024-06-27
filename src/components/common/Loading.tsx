import loadingImage from "@/assets/images/loading.gif";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="w-24 h-24 object-contain">
      <Image src={loadingImage} alt="loading" />
    </div>
  );
};

export default Loading;
