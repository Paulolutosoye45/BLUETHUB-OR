import graphInfo from "@/assets/png/graph_info.png";
import DataColunm from "./component/data-column";


const Charts = () => {
  const teachersData = [
    "A", "T", "B", "J"
    // date: "12/05/2024",
  // {
  //   initials: ["A", "T", "S", "J"],
  //   date: "12/01/2025",
  // },
];
  return (
    <section>
      <div className="flex gap-2 mt-10  w-full border-0 border-Bpink">
        <div className="flex-[60%] flex-grow-0 h-[410px] bg-white rounded-xl">
          <img
            src={graphInfo}
            alt="Graph Info"
            className="w-full h-full object-fill"
          />
        </div>
        <div className="flex-[40%] flex-grow-0 h-[410px] border-0 border-red-900 bg-white rounded-xl px-6 py-2">
          <h2 className="font-poppins font-medium text-base text-chestnut inline-block">
            Exam
          </h2>
          <span className="font-poppins ml-2 font-medium text-sm text-[#29238280] ">
            Activity
          </span>

          <div className="border-0 border-red-700  w-[80%]">
            <div className="flex items-center gap-3  rounded-lg py-3 ">
              <div className="bg-[#e5e0f6] rounded-lg p-2 flex items-center justify-center">
                <svg
                  viewBox="0 0 12 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-lue"
                >
                  <path
                    d="M3.39612 1.18265C3.39612 0.99072 3.46562 0.806653 3.58933 0.67094C3.71304 0.535227 3.88083 0.458984 4.05578 0.458984C4.23073 0.458984 4.39851 0.535227 4.52222 0.67094C4.64593 0.806653 4.71543 0.99072 4.71543 1.18265V1.90631H7.35405V1.18265C7.35405 0.99072 7.42354 0.806653 7.54725 0.67094C7.67096 0.535227 7.83875 0.458984 8.0137 0.458984C8.18865 0.458984 8.35644 0.535227 8.48014 0.67094C8.60385 0.806653 8.67335 0.99072 8.67335 1.18265V1.90631C9.37316 1.90631 10.0443 2.21128 10.5391 2.75413C11.034 3.29699 11.312 4.03325 11.312 4.80096V9.14294H8.0137C7.48885 9.14294 6.98549 9.37166 6.61436 9.7788C6.24324 10.1859 6.03474 10.7381 6.03474 11.3139V14.9322H3.39612C2.69632 14.9322 2.02518 14.6273 1.53034 14.0844C1.0355 13.5416 0.757507 12.8053 0.757507 12.0376V4.80096C0.757507 4.03325 1.0355 3.29699 1.53034 2.75413C2.02518 2.21128 2.69632 1.90631 3.39612 1.90631V1.18265ZM3.39612 5.52462C3.39612 5.71655 3.46562 5.90062 3.58933 6.03633C3.71304 6.17204 3.88083 6.24829 4.05578 6.24829H8.0137C8.18865 6.24829 8.35644 6.17204 8.48014 6.03633C8.60385 5.90062 8.67335 5.71655 8.67335 5.52462C8.67335 5.3327 8.60385 5.14863 8.48014 5.01292C8.35644 4.8772 8.18865 4.80096 8.0137 4.80096H4.05578C3.88083 4.80096 3.71304 4.8772 3.58933 5.01292C3.46562 5.14863 3.39612 5.3327 3.39612 5.52462ZM3.39612 8.41927C3.39612 8.6112 3.46562 8.79527 3.58933 8.93098C3.71304 9.06669 3.88083 9.14294 4.05578 9.14294H5.37508C5.55004 9.14294 5.71782 9.06669 5.84153 8.93098C5.96524 8.79527 6.03474 8.6112 6.03474 8.41927C6.03474 8.22735 5.96524 8.04328 5.84153 7.90757C5.71782 7.77185 5.55004 7.69561 5.37508 7.69561H4.05578C3.88083 7.69561 3.71304 7.77185 3.58933 7.90757C3.46562 8.04328 3.39612 8.22735 3.39612 8.41927ZM4.05578 12.0376C4.23073 12.0376 4.39851 11.9613 4.52222 11.8256C4.64593 11.6899 4.71543 11.5059 4.71543 11.3139C4.71543 11.122 4.64593 10.9379 4.52222 10.8022C4.39851 10.6665 4.23073 10.5903 4.05578 10.5903C3.88083 10.5903 3.71304 10.6665 3.58933 10.8022C3.46562 10.9379 3.39612 11.122 3.39612 11.3139C3.39612 11.5059 3.46562 11.6899 3.58933 11.8256C3.71304 11.9613 3.88083 12.0376 4.05578 12.0376ZM7.35405 11.3139C7.35405 11.122 7.42354 10.9379 7.54725 10.8022C7.67096 10.6665 7.83875 10.5903 8.0137 10.5903H11.312L7.35405 14.9322V11.3139Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-poppins font-semibold text-[#292382] text-sm mb-1">
                  Exam Attends
                </h2>
                <div className="w-full bg-gray-200 rounded-full h-[4px]">
                  <div
                    className="bg-lue h-[4px] rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg py-3 ">
              <div className="bg-[#e5e0f6] rounded-lg p-2 flex items-center justify-center">
                <svg
                  viewBox="0 0 12 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-Bmark"
                >
                  <path
                    d="M3.39612 1.18265C3.39612 0.99072 3.46562 0.806653 3.58933 0.67094C3.71304 0.535227 3.88083 0.458984 4.05578 0.458984C4.23073 0.458984 4.39851 0.535227 4.52222 0.67094C4.64593 0.806653 4.71543 0.99072 4.71543 1.18265V1.90631H7.35405V1.18265C7.35405 0.99072 7.42354 0.806653 7.54725 0.67094C7.67096 0.535227 7.83875 0.458984 8.0137 0.458984C8.18865 0.458984 8.35644 0.535227 8.48014 0.67094C8.60385 0.806653 8.67335 0.99072 8.67335 1.18265V1.90631C9.37316 1.90631 10.0443 2.21128 10.5391 2.75413C11.034 3.29699 11.312 4.03325 11.312 4.80096V9.14294H8.0137C7.48885 9.14294 6.98549 9.37166 6.61436 9.7788C6.24324 10.1859 6.03474 10.7381 6.03474 11.3139V14.9322H3.39612C2.69632 14.9322 2.02518 14.6273 1.53034 14.0844C1.0355 13.5416 0.757507 12.8053 0.757507 12.0376V4.80096C0.757507 4.03325 1.0355 3.29699 1.53034 2.75413C2.02518 2.21128 2.69632 1.90631 3.39612 1.90631V1.18265ZM3.39612 5.52462C3.39612 5.71655 3.46562 5.90062 3.58933 6.03633C3.71304 6.17204 3.88083 6.24829 4.05578 6.24829H8.0137C8.18865 6.24829 8.35644 6.17204 8.48014 6.03633C8.60385 5.90062 8.67335 5.71655 8.67335 5.52462C8.67335 5.3327 8.60385 5.14863 8.48014 5.01292C8.35644 4.8772 8.18865 4.80096 8.0137 4.80096H4.05578C3.88083 4.80096 3.71304 4.8772 3.58933 5.01292C3.46562 5.14863 3.39612 5.3327 3.39612 5.52462ZM3.39612 8.41927C3.39612 8.6112 3.46562 8.79527 3.58933 8.93098C3.71304 9.06669 3.88083 9.14294 4.05578 9.14294H5.37508C5.55004 9.14294 5.71782 9.06669 5.84153 8.93098C5.96524 8.79527 6.03474 8.6112 6.03474 8.41927C6.03474 8.22735 5.96524 8.04328 5.84153 7.90757C5.71782 7.77185 5.55004 7.69561 5.37508 7.69561H4.05578C3.88083 7.69561 3.71304 7.77185 3.58933 7.90757C3.46562 8.04328 3.39612 8.22735 3.39612 8.41927ZM4.05578 12.0376C4.23073 12.0376 4.39851 11.9613 4.52222 11.8256C4.64593 11.6899 4.71543 11.5059 4.71543 11.3139C4.71543 11.122 4.64593 10.9379 4.52222 10.8022C4.39851 10.6665 4.23073 10.5903 4.05578 10.5903C3.88083 10.5903 3.71304 10.6665 3.58933 10.8022C3.46562 10.9379 3.39612 11.122 3.39612 11.3139C3.39612 11.5059 3.46562 11.6899 3.58933 11.8256C3.71304 11.9613 3.88083 12.0376 4.05578 12.0376ZM7.35405 11.3139C7.35405 11.122 7.42354 10.9379 7.54725 10.8022C7.67096 10.6665 7.83875 10.5903 8.0137 10.5903H11.312L7.35405 14.9322V11.3139Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-poppins font-semibold text-[#292382] text-sm leading-tight mb-1">
                  Exam Attends
                </h2>
                <div className="w-full bg-gray-200 rounded-full h-[4px]">
                  <div
                    className="bg-Bmark h-[4px] rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3  rounded-lg  py-3">
              <div className="bg-[#e5e0f6] rounded-lg p-2 flex items-center justify-center">
                <svg
                  viewBox="0 0 12 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-Bpink"
                >
                  <path
                    d="M3.39612 1.18265C3.39612 0.99072 3.46562 0.806653 3.58933 0.67094C3.71304 0.535227 3.88083 0.458984 4.05578 0.458984C4.23073 0.458984 4.39851 0.535227 4.52222 0.67094C4.64593 0.806653 4.71543 0.99072 4.71543 1.18265V1.90631H7.35405V1.18265C7.35405 0.99072 7.42354 0.806653 7.54725 0.67094C7.67096 0.535227 7.83875 0.458984 8.0137 0.458984C8.18865 0.458984 8.35644 0.535227 8.48014 0.67094C8.60385 0.806653 8.67335 0.99072 8.67335 1.18265V1.90631C9.37316 1.90631 10.0443 2.21128 10.5391 2.75413C11.034 3.29699 11.312 4.03325 11.312 4.80096V9.14294H8.0137C7.48885 9.14294 6.98549 9.37166 6.61436 9.7788C6.24324 10.1859 6.03474 10.7381 6.03474 11.3139V14.9322H3.39612C2.69632 14.9322 2.02518 14.6273 1.53034 14.0844C1.0355 13.5416 0.757507 12.8053 0.757507 12.0376V4.80096C0.757507 4.03325 1.0355 3.29699 1.53034 2.75413C2.02518 2.21128 2.69632 1.90631 3.39612 1.90631V1.18265ZM3.39612 5.52462C3.39612 5.71655 3.46562 5.90062 3.58933 6.03633C3.71304 6.17204 3.88083 6.24829 4.05578 6.24829H8.0137C8.18865 6.24829 8.35644 6.17204 8.48014 6.03633C8.60385 5.90062 8.67335 5.71655 8.67335 5.52462C8.67335 5.3327 8.60385 5.14863 8.48014 5.01292C8.35644 4.8772 8.18865 4.80096 8.0137 4.80096H4.05578C3.88083 4.80096 3.71304 4.8772 3.58933 5.01292C3.46562 5.14863 3.39612 5.3327 3.39612 5.52462ZM3.39612 8.41927C3.39612 8.6112 3.46562 8.79527 3.58933 8.93098C3.71304 9.06669 3.88083 9.14294 4.05578 9.14294H5.37508C5.55004 9.14294 5.71782 9.06669 5.84153 8.93098C5.96524 8.79527 6.03474 8.6112 6.03474 8.41927C6.03474 8.22735 5.96524 8.04328 5.84153 7.90757C5.71782 7.77185 5.55004 7.69561 5.37508 7.69561H4.05578C3.88083 7.69561 3.71304 7.77185 3.58933 7.90757C3.46562 8.04328 3.39612 8.22735 3.39612 8.41927ZM4.05578 12.0376C4.23073 12.0376 4.39851 11.9613 4.52222 11.8256C4.64593 11.6899 4.71543 11.5059 4.71543 11.3139C4.71543 11.122 4.64593 10.9379 4.52222 10.8022C4.39851 10.6665 4.23073 10.5903 4.05578 10.5903C3.88083 10.5903 3.71304 10.6665 3.58933 10.8022C3.46562 10.9379 3.39612 11.122 3.39612 11.3139C3.39612 11.5059 3.46562 11.6899 3.58933 11.8256C3.71304 11.9613 3.88083 12.0376 4.05578 12.0376ZM7.35405 11.3139C7.35405 11.122 7.42354 10.9379 7.54725 10.8022C7.67096 10.6665 7.83875 10.5903 8.0137 10.5903H11.312L7.35405 14.9322V11.3139Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-poppins font-semibold text-[#292382] text-sm mb-1">
                  Exam Attends
                </h2>
                <div className="w-full bg-gray-200 rounded-full h-[4px]">
                  <div
                    className="bg-Bpink h-[4px] rounded-full"
                    style={{ width: "55%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-0 border-red-900 h-[50%] p-3">
            <h4 className="text-[#292382] font-poppins font-medium text-base">
              80% Success
            </h4>
            <div className="flex  gap-8 flex-wrap items-center border-0 border-red-700 justify-center">
              {/* Nested Circular Progress */}
              <div className="relative w-[12rem]">
                {/* Outer Circle */}
                <svg
                  className=""
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {/* Background */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-gray-200"
                    strokeWidth="1"
                  />
                  {/* Progress */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-lue"
                    strokeWidth="1"
                    strokeDasharray="100"
                    strokeDashoffset={100 - 80}
                    strokeLinecap="round"
                  />
                </svg>

                <svg
                  className="absolute top-4 left-4  w-[10rem]"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-gray-200"
                    strokeWidth="1"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-Bmark"
                    strokeWidth="1"
                    strokeDasharray="100"
                    strokeDashoffset={100 - 75}
                    strokeLinecap="round"
                  />
                </svg>

                <svg
                  className="absolute top-8 left-8  w-[8rem]"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-gray-200"
                    strokeWidth="1"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-Bpink"
                    strokeWidth="1"
                    strokeDasharray="100"
                    strokeDashoffset={100 - 55}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className=" border-0  border-yellow-600 space-y-4 p-4">
              {/* English */}
              <div className="flex items-center gap-4">
                <span className="p-2 rounded-full bg-lue"></span>
                <div className=" flex-col font-poppins font-normal flex justify-between w-full text-[#8A92A6]">
                  <span>English</span>
                  <span className="text-lue font-semibold">80%</span>
                </div>
              </div>

              {/* French */}
              <div className="flex items-center gap-4">
                <span className="p-2 rounded-full bg-Bpink"></span>
                <div className="flex flex-col font-poppins font-normal justify-between w-full text-[#8A92A6]">
                  <span>French</span>
                  <span className="text-Bpink font-semibold">55%</span>
                </div>
              </div>

              {/* Mathematics */}
              <div className="flex items-center  gap-4">
                <span className="p-2 rounded-full bg-Bmark"></span>
                <div className=" flex flex-col font-normal justify-between w-full text-[#8A92A6]">
                  <span>Mathematics</span>
                  <span className="text-Bmark font-semibold">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-0  border-red-700 flex pt-6 relative">

      <DataColunm/> 
      <div>
        <h2 className="text-xl text-[#292382] font-poppins font-medium  ledaing-[130%] mx-2 my-4">Teachers </h2>
        <div className="border-2 border-[#292382] px-4 py-2 flex  justify-between gap-2 rounded-md items-center mb-2 ">
          <div className="flex  gap-4 items-center">
             <div className="flex -space-x-3.5 ">
              {teachersData.map((item, index) => (
                <div
                  key={index}
                  className={`w-[30.93px]  h-[30.14px] text-center rounded-full text-white bg-[#EC1B2C] text-xl font-medium font-poppins `}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-[#29238280] h-[38.33px] p-[2px] rounded-xl"></div>
          </div>
          <div className="bg-[#29238280]   ">
             
          </div>
          <div className="text-center">
            <h5 className="font-poppins text-[10.7px] font-medium  text-[#292382]">Awarded</h5>
            <h5 className="font-poppins text-[10.7px] font-medium  text-[#29238280]">12/ 05/2024</h5>
          </div>
        </div>
        <div className="border-2 border-[#292382] px-4 py-2 flex  justify-between gap-2 rounded-md items-center mb-2 ">
          <div className="flex  gap-4 items-center">
             <div className="flex -space-x-3.5 ">
              {teachersData.map((item, index) => (
                <div
                  key={index}
                  className={`w-[30.93px]  h-[30.14px] text-center rounded-full text-white bg-[#EC1B2C] text-xl font-medium font-poppins `}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-[#29238280] h-[38.33px] p-[2px] rounded-xl"></div>
          </div>
          <div className="bg-[#29238280]   ">
             
          </div>
          <div className="text-center">
            <h5 className="font-poppins text-[10.7px] font-medium  text-[#292382]">Awarded</h5>
            <h5 className="font-poppins text-[10.7px] font-medium  text-[#29238280]">12/ 05/2024</h5>
          </div>
        </div>

        <div className="flex gap-2 items-center  cursor-pointer absolute  ml-48">
        <h2 className="text-[#292382] font-poppins font-medium text-[15.66px]">Read more</h2>
        <span className="text-lg text-[#292382]">▸</span>
      </div>
      </div>
      </section>
    </section>
  );
};

export default Charts;
