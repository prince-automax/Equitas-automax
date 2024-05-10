import DashboardTemplate from "../../components/templates/DashboardTemplate";
import withPrivateRoute from "../../utils/withPrivateRoute";
import Image from "next/image";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";
import {
  faThumbsUp,
  faThumbsDown,
  faUserSlash,
  faLocation,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PostThumb1 from "@assets/blog/C1.jpg";
import PostThumb2 from "@assets/blog/C2.jpg";
import PostThumb3 from "@assets/blog/C3.jpg";
import { useRouter } from "next/router";
import { Tab } from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import { useQueryClient } from "react-query";
import {
  CreateBidMutationVariables,
  GetEventQuery,
  OrderDirection,
  useCreateBidMutation,
  useGetEventQuery,
  useVehiclesQuery,
  VehiclesQuery,
  QueryQueryVariables,
  useQueryQuery,
  useStockVehiclesQuery,
  StockVehiclesQuery,
  StockVehiclesQueryVariables
} from "@utils/graphql";
import graphQLClient from "@utils/useGQLQuery";
import moment from "moment";
import Swal from "sweetalert2";
import {
  ContactSection,
  Sections,
  VehicleDetails,
  moreDetails,
} from "../../utils/stocks";
import ImageCarouselModal from "@components/modals/ImageCarouselModal";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Stock() {
  const router = useRouter();
  const { id } = router.query;
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [interval, setAPIInterval] = useState(1000);
  const [vehicle, setVehicle] = useState(null);
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [tick, setTick] = useState(0);
  const [serverTime, setserverTime] = useState(null);
  const [showImageCarouselModal, setShowImageCarouselModal] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");
      setAccessToken(token);
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    const currentUrl = window.location.href;
    console.log("currentURl", currentUrl);
    localStorage.setItem("currentUrl", currentUrl);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((tic) => tic + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: timeData } = useQueryQuery<QueryQueryVariables>(
    graphQLClient(),
    {},
    { refetchInterval: 60000 }
  );

  useEffect(() => {
    if (timeData && timeData.time) {
      setTick(0);
      setserverTime(timeData.time);
    }
  }, [timeData]);

  const callCreateBid = useCreateBidMutation<CreateBidMutationVariables>(
    graphQLClient({ Authorization: `Bearer ${accessToken}` })
  );

  const { data, isLoading } = useVehiclesQuery<VehiclesQuery>(
    graphQLClient({ Authorization: `Bearer ${accessToken}` }),
    {
      where: {
        id: {
          equals: id as string,
        },
      },
      take: 1,
      skip: 0,
      userVehicleBidsOrderBy2: [{ amount: OrderDirection.Desc }],
    },
    {
      cacheTime: 5,
      refetchInterval: interval,
      enabled: accessToken !== "" && id !== "",
    }
  );

  const options = {
    rewind: true,
    gap: 1, // Adjust gap as needed
    autoplay: true,
    interval: 2000, // Set autoplay interval in milliseconds
    pauseOnHover: false,
    resetProgress: false,
    pagination: true,
    arrows: false,
  };
  // Inline styles for customization
  const customStyles = {
    pagination: {
      marginTop: "10px", // Adjust the spacing between the images and dots
    },
    page: {
      width: "10px", // Set the width of each dot
      height: "10px", // Set the height of each dot
      borderRadius: "50%", // Make the dots circular
      backgroundColor: "#333", // Set the background color of the dots
      margin: "0 5px", // Adjust the spacing between the dots
    },
    activePage: {
      backgroundColor: "#ff0000", // Set the background color of the active dot
    },
  };

  let [tabs] = useState({
    "General ": [],
    Registration: [],
    Insurance: [],
    "Other ": [],
  });

  useEffect(() => {
    setVehicle(
      data && data.vehicles && data.vehicles[0] ? data.vehicles[0] : null
    );
  }, [data]);

  useEffect(() => {
    setImages(vehicle?.frontImage?.split(","));
  }, [vehicle]);

  async function CallBid(amount, vehicleId) {
    const confirmed = await Swal.fire({
      text: "Are you sure to bid for Rs. " + amount + "?",
      title: "BID CONFIMATION",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, bid for it!",
      customClass: {
        popup: "animated bounceInDown",
        container: "custom-swal-container",
      },
    });

    if (confirmed.isConfirmed) {
      try {
        const cc = await callCreateBid.mutateAsync({
          data: {
            amount: parseInt(amount),
            bidVehicle: {
              connect: {
                id: vehicleId,
              },
            },
          },
        });
        // console.log("cc: ", cc);
        Swal.fire("Success!", "Your bid has been submitted.", "success");
      } catch (e) {
        // console.log("EEE: ", e);
      }
    }
  }
  function IsCompleted() {
    try {
      let bidTime = data.vehicles[0].bidTimeExpire;

      const expiryTime = moment(bidTime);
      const currentTime = moment(serverTime).add(tick, "seconds");
      const diff = expiryTime.diff(currentTime, "seconds");

      if (diff > 0) {
        return true;
      } else {
        return false;
      }
    } catch {}
    return true;
  }

  useEffect(() => {
    if (vehicle?.event?.bidLock === "locked") {
      if (vehicle?.currentBidAmount) {
        setBidAmount(vehicle?.currentBidAmount + +vehicle?.quoteIncreament);
      } else if (vehicle?.startPrice) {
        setBidAmount(vehicle?.startPrice);
      } else if (!vehicle?.startPrice) {
        setBidAmount(vehicle?.quoteIncreament);
      }
    } else {
      if (vehicle?.currentBidAmount) {
        let amt = vehicle?.userVehicleBids?.length
          ? vehicle?.userVehicleBids[0]?.amount + +vehicle?.quoteIncreament
          : vehicle?.startPrice;
        setBidAmount(amt.toString());
      } else if (vehicle?.startPrice) {
        setBidAmount(vehicle?.startPrice);
      } else if (!vehicle?.startPrice) {
        setBidAmount(vehicle?.quoteIncreament);
      }
    }
  }, [vehicle?.event?.bidLock, vehicle]);

  const Data = {
    seller: "Indus Ind ",
    posted: "02-02-2020",
    eventId: "24565888",
    bankName: "autobse",
  };

  return (
    <DashboardTemplate>
      <div>



        {/* DESKTOP VIEW */}
        <div className="hidden sm:block">
          <div className=" px-6 mb-8 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Vehicle
              </h2>
            </div>
            {/* <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <MinusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Remove from watchlist
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Add to watchlist
          </button>
        </div> */}
          </div>
          <div className="mt-2 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-start-1 lg:col-span-2 w-full">
              {/* deskop view for the image vstarts here */}
              <section className="hidden sm:block w-full">
                <Tab.Group
                  as="div"
                  className="flex flex-col max-w-2xl justify-between"
                >
                  <div className="w-full    max-w-3xl mx-auto sm:block">
                    <Tab.Panels className="w-full aspect-w-1 aspect-h-1">
                      {images?.map((image, index) => (
                        <Tab.Panel key={image.id}>
                          <Image
                            alt={`image${index}`}
                            src={image.trim()}
                            className="w-full h-full sm:rounded-lg "
                            width={500}
                            height={300}
                            objectFit="cover"
                          />
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </div>

                  <div className=" mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                    <Tab.List className="grid grid-cols-4 gap-6">
                      {images?.map((image, index) => (
                        <Tab
                          key={index}
                          className="relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-50"
                        >
                          {({ selected }) => (
                            <>
                              {/* <span className="sr-only">{image.name}</span> */}
                              <span className="absolute inset-0 rounded-md overflow-hidden">
                                <Image
                                  alt={image}
                                  src={image.trim()}
                                  className="w-full h-full object-center object-cover"
                                  layout="fill"
                                />
                              </span>
                              <span
                                className={classNames(
                                  selected
                                    ? "ring-indigo-500"
                                    : "ring-transparent",
                                  "absolute inset-0 rounded-md ring-2 ring-offset-2 pointer-events-none"
                                )}
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>
                </Tab.Group>
              </section>

              {/* deskop view for the image ends here */}

              {/* mobile view of image starts here*/}
              {vehicle?.frontImage ? (
                <section className="sm:hidden border-2 ">
                  <div className=" h-fit border-2 rounded-lg  ">
                    <Splide options={options} aria-label="React Splide Example">
                      {images?.map((image, index) => (
                        <SplideSlide key={index}>
                          <Image
                            alt={`image${index}`}
                            src={image.trim()}
                            className="w-full h-full object-center object-cover rounded-lg "
                            width={500}
                            height={300}
                          />
                        </SplideSlide>
                      ))}
                    </Splide>
                  </div>
                </section>
              ) : (
                <div className=" text-center sm:hidden  ">
                  <p className="font-poppins font-semibold animate-pulse ">
                    No images for this vehicle
                  </p>
                </div>
              )}
              {/* mobile view of image ends here*/}

              <section>
                <div>
                  <div className="mb-4 text-xl font-semibold text-gray-900">
                    Specifications
                  </div>
                  <div className="w-full  mt-4">
                    <Tab.Group>
                      <Tab.List className="flex justify-between space-x-1 rounded-xl">
                        {/* <div className="flex bg-amber-500"> */}
                        {Object.keys(tabs).map((tab) => (
                          <Tab
                            key={tab}
                            className={({ selected }) =>
                              classNames(
                                "w-full px-1 rounded-lg py-2.5 text-sm font-medium leading-5 bg-gray-200",
                                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none",
                                selected
                                  ? "bg-blue-900 text-black shadow"
                                  : "text-[#787777] hover:text-gray-900"
                              )
                            }
                          >
                            {tab}
                          </Tab>
                        ))}
                        {/* </div> */}
                      </Tab.List>

                      <Tab.Panels className="mt-4">
                        <Tab.Panel
                          className={"rounded-xl bg-white focus:outline-none"}
                        >
                          <GeneralDetailsTab vehicle={vehicle} />
                        </Tab.Panel>
                        <Tab.Panel
                          className={"rounded-xl bg-white  focus:outline-none"}
                        >
                          <RegistrationDetailsTab vehicle={vehicle} />
                        </Tab.Panel>
                        <Tab.Panel
                          className={"rounded-xl bg-white  focus:outline-none"}
                        >
                          <InsuranceDetailsTab vehicle={vehicle} />
                        </Tab.Panel>
                        <Tab.Panel
                          className={"rounded-xl bg-white  focus:outline-none"}
                        >
                          <OtherDetailsTab vehicle={vehicle} />
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </div>
              </section>
            </div>

            <section className="lg:col-start-3 lg:col-span-1 ">
              <div className="bg-indigo-700 rounded-lg shadow mb-6">
                <div className="px-4 py-6 font">
                  <h2 className="text-xl font-semibold text-white">
                    Bid Details
                  </h2>

                  <dl className="mt-6 space-y-4 ">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-200">Start Price</dt>
                      <dd className="text-sm font-medium text-gray-200">
                        {vehicle?.startPrice}
                      </dd>
                    </div>
                    {vehicle?.event?.bidLock === "locked" ? (
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-200">Current Quote</dt>
                        <dd className="text-sm font-medium text-gray-200">
                          {vehicle?.currentBidAmount ?? "N/A"}
                        </dd>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-200">Latest Quote</dt>
                        <dd className="text-sm font-medium text-gray-200">
                          {vehicle?.userVehicleBids?.length
                            ? vehicle?.userVehicleBids[0].amount
                            : "N/A"}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-200">Rank</dt>
                      <dd className="text-sm font-medium text-gray-200">
                        {vehicle?.myBidRank}
                      </dd>
                    </div>

                    <div className="border-t border-indigo-600 pt-4 flex items-center justify-between">
                      <dt className="flex text-sm text-gray-200">
                        <span>Quote Increment</span>
                      </dt>
                      <dd className="text-sm font-medium text-gray-200">
                        {vehicle?.quoteIncreament}
                      </dd>
                    </div>
                  </dl>

                  <input
                    className="mt-6 w-full border-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md"
                    placeholder="Enter bid amount"
                    value={bidAmount !== "0" ? bidAmount : vehicle?.startPrice}
                    onChange={(e) => {
                      setBidAmount(e.target.value.replace(/\D/g, ""));
                    }}
                  />

                  <button
                    type="submit"
                    onClick={() => {
                      if (parseInt(bidAmount) % 100 != 0) {
                        Swal.fire({
                          title: "Bid amount should be multiple of 100",
                          confirmButtonText: "OK",
                          position: "top",
                        });
                      } else if (
                        vehicle?.event?.bidLock === "locked" &&
                        vehicle?.currentBidAmount >= parseInt(bidAmount)
                      ) {
                        Swal.fire({
                          title: "Bid amount should be greater than last bid",
                          confirmButtonText: "OK",
                          position: "top",
                        });
                      }
                      //  else if (
                      //   vehicle?.event?.bidLock != "locked" &&
                      //   vehicle?.userVehicleBids?.length &&
                      //   vehicle?.userVehicleBids[0].amount >= parseInt(bidAmount)
                      // ) {
                      //   Swal.fire({
                      //     title: "Bid amount should be greater than last bid",
                      //     confirmButtonText: "OK",
                      //     position: "top",
                      //   });
                      // }
                      else if (
                        //vehicle?.event?.bidLock === "locked" &&

                        parseInt(bidAmount) % vehicle?.quoteIncreament !==
                        0
                      ) {
                        Swal.fire({
                          title:
                            "Bid amount should be greater than minimum quote increment.",
                          confirmButtonText: "OK",
                          position: "top",
                        });
                      }
                      // else if(   vehicle?.event?.bidLock  != "locked" &&
                      // vehicle?.userVehicleBids?.length &&
                      // vehicle.quoteIncreament >
                      //   parseInt(bidAmount) - vehicle?.userVehicleBids[0].amount){
                      //     Swal.fire({
                      //       title:
                      //         "Bid amount should be greater than minimum quote increment.",
                      //       confirmButtonText: "OK",
                      //       position: "top",
                      //     });

                      // }
                      else if (vehicle?.startPrice > parseInt(bidAmount)) {
                        Swal.fire({
                          title:
                            "Bid amount should be greater than start price.",
                          confirmButtonText: "OK",
                          position: "top",
                        });
                      } else if (parseInt(bidAmount) > 2147483647) {
                        Swal.fire({
                          title: "Bid amount exceeded the limit.",
                          confirmButtonText: "OK",
                          position: "top",
                        });
                      } else {
                        CallBid(bidAmount, vehicle?.id);
                        setTimeout(() => {
                          // setBidAmount("");
                        }, 1000);
                      }
                    }}
                    className="mt-3 w-full flex items-center justify-center px-5 py-3 border border-transparent text-xl font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                  >
                    BID NOW
                  </button>

                  <p className=" text-sm text-indigo-100">
                    {/* {vehicle?.userVehicleBidsCount && vehicle?.myBidRank ? (
                  vehicle?.myBidRank == 1 ? (
                    <span style={{ color: "#00CC00" }}>Winning</span>
                  ) : (
                    <span style={{ color: "#FF3333" }}>Losing</span>
                  )
                ) : (
                  <span style={{ color: "#CCCC00" }}>Not Enrolled</span>
                )} */}
                    <div className="mt-4 w-full border-white text-center bg-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md">
                      {vehicle?.userVehicleBidsCount && vehicle?.myBidRank ? (
                        vehicle?.myBidRank == 1 ? (
                          <p className="text-green-500 font-bold text-base space-x-1">
                            <FontAwesomeIcon icon={faThumbsUp} />{" "}
                            <span className="text-green-500 uppercase">
                              {" "}
                              Highest Bid
                            </span>
                          </p>
                        ) : (
                          <p className="text-red-500 font-bold text-base space-x-1">
                            <FontAwesomeIcon icon={faThumbsDown} />{" "}
                            <span
                              style={{ color: "#FF3333" }}
                              className="uppercase"
                            >
                              Losing
                            </span>
                          </p>
                        )
                      ) : (
                        <p className="text-black font-bold text-base space-x-1">
                          <FontAwesomeIcon icon={faUserSlash} />
                          <span className="text-black uppercase">
                            {" "}
                            Not Enrolled{" "}
                          </span>
                        </p>
                      )}
                    </div>
                  </p>
                  <div className="mt-4 w-full    border-white text-center bg-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md">
                    <p className="  text-black font-roboto font-semibold uppercase">
                     Approval status
                    </p>
                    <p className="tracking-wide text-blue-500	uppercase">
                      {vehicle?.bidStatus}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="sm:hidden bg-white">

          <div className=" max-w-3xl mx-auto grid grid-cols-1 gap-0 ">

            {/* mobile view of image starts here*/}
            <div className="space-y-6  w-full">
              {vehicle?.frontImage ? (
                // <section className="sm:hidden border-2 ">
                //   <div className=" h-fit border-2 rounded-lg  ">
                //     <Splide options={options} aria-label="React Splide Example">
                //       {images?.map((image, index) => (
                //         <SplideSlide key={index}>
                //           <Image
                //             alt={`image${index}`}
                //             src={image.trim()}
                //             className="w-full h-full object-center object-cover rounded-lg "
                //             width={500}
                //             height={300}
                //           />
                //         </SplideSlide>
                //       ))}
                //     </Splide>
                //   </div>
                // </section>
                <div
                        className="flex-none w-70 h-56  sm:max-md:h-56 sm:max-md:w-full  relative p-6 m-2 hover:cursor-pointer"
                        onClick={() => {
                          // BindVehicleImage(item);
                          setImages((vehicle?.frontImage).split(","));

                          setShowImageCarouselModal(true);
                        }}
                      >
                        <Image
                          alt="img"
                          src={vehicle?.frontImage}
                          layout="fill"
                          className="absolute inset-0 w-full h-full object-cover rounded"
                        />
                      </div>
              ) : (
                <div className=" text-center sm:hidden  ">
                  <p className="font-poppins font-semibold animate-pulse ">
                    No images for this vehicle
                  </p>
                </div>
              )}
            </div>
            {/* mobile view of image ends here*/}


            {/* ALL SELECTIONS START HERE  */}
            <div>
             
              <section>
             
                  {/* <h1 className="text-xl  text-center uppercase font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate p-2">
                    Indus Ind Bank Pvt Ltd
                  </h1> */}


{/* BID BOX STARTS HERE */}
                  <div>
                    <section className="lg:col-start-3 lg:col-span-1 px-1">
                      <div className="bg-indigo-700 rounded-lg shadow mb-2">
                        <div className="px-4 py-1 text-3xl font-bold">
                          {/* <h2 className="text-lg font-semibold text-white">
                      Bid Details
                    </h2> */}

                          <dl className="mt-1 space-y-1 ">
                            <div className="flex items-center justify-between">
                              <dt className=" text-gray-200 text-2xl ">
                                Start Price
                              </dt>
                              <dd className=" text-gray-200">
                              ₹ {vehicle?.startPrice}
                              </dd>
                            </div>
                            {vehicle?.event?.bidLock === "locked" ? (
                              <div className="flex items-center justify-between">
                                <dt className=" text-gray-200 text-2xl">
                                  Current Quote
                                </dt>
                                <dd className="  text-gray-200">
                                ₹{vehicle?.currentBidAmount ?? "N/A"}
                                </dd>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <dt className=" text-gray-200 text-2xl">
                                  Latest Quote
                                </dt>
                                <dd className=" text-gray-200">
                                ₹ {vehicle?.userVehicleBids?.length
                                    ? vehicle?.userVehicleBids[0].amount
                                    : "N/A"}
                                </dd>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <dt className=" text-gray-200 text-2xl">Rank</dt>
                              <dd className=" text-gray-200">
                                {vehicle?.myBidRank}
                              </dd>
                            </div>

                            <div className="border-t border-indigo-600 pt-1 flex items-center justify-between">
                              <dt className="flex  text-2xl text-gray-200">
                                <span>Quote Increment</span>
                              </dt>
                              <dd className=" text-gray-200">
                              ₹ {vehicle?.quoteIncreament}
                              </dd>
                            </div>
                          </dl>

                          <input
                            className="mt-2 text-4xl w-full border-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md"
                            placeholder="Enter bid amount"
                            value={      
                              bidAmount !== "0"
                                ? bidAmount
                                : vehicle?.startPrice
                            }
                            onChange={(e) => {
                              setBidAmount(e.target.value.replace(/\D/g, ""));
                            }}
                          />

                          <button
                            type="submit"
                            onClick={() => {
                              if (parseInt(bidAmount) % 100 != 0) {
                                Swal.fire({
                                  title: "Bid amount should be multiple of 100",
                                  confirmButtonText: "OK",
                                  position: "top",
                                });
                              } else if (
                                vehicle?.event?.bidLock === "locked" &&
                                vehicle?.currentBidAmount >= parseInt(bidAmount)
                              ) {
                                Swal.fire({
                                  title:
                                    "Bid amount should be greater than last bid",
                                  confirmButtonText: "OK",
                                  position: "top",
                                });
                              }
                              //  else if (
                              //   vehicle?.event?.bidLock != "locked" &&
                              //   vehicle?.userVehicleBids?.length &&
                              //   vehicle?.userVehicleBids[0].amount >= parseInt(bidAmount)
                              // ) {
                              //   Swal.fire({
                              //     title: "Bid amount should be greater than last bid",
                              //     confirmButtonText: "OK",
                              //     position: "top",
                              //   });
                              // }
                              else if (
                                //vehicle?.event?.bidLock === "locked" &&

                                parseInt(bidAmount) %
                                  vehicle?.quoteIncreament !==
                                0
                              ) {
                                Swal.fire({
                                  title:
                                    "Bid amount should be greater than minimum quote increment.",
                                  confirmButtonText: "OK",
                                  position: "top",
                                });
                              }
                              // else if(   vehicle?.event?.bidLock  != "locked" &&
                              // vehicle?.userVehicleBids?.length &&
                              // vehicle.quoteIncreament >
                              //   parseInt(bidAmount) - vehicle?.userVehicleBids[0].amount){
                              //     Swal.fire({
                              //       title:
                              //         "Bid amount should be greater than minimum quote increment.",
                              //       confirmButtonText: "OK",
                              //       position: "top",
                              //     });

                              // }
                              else if (
                                vehicle?.startPrice > parseInt(bidAmount)
                              ) {
                                Swal.fire({
                                  title:
                                    "Bid amount should be greater than start price.",
                                  confirmButtonText: "OK",
                                  position: "top",
                                });
                              } else if (parseInt(bidAmount) > 2147483647) {
                                Swal.fire({
                                  title: "Bid amount exceeded the limit.",
                                  confirmButtonText: "OK",
                                  position: "top",
                                });
                              } else {
                                CallBid(bidAmount, vehicle?.id);
                                setTimeout(() => {
                                  // setBidAmount("");
                                }, 1000);
                              }
                            }}
                            className="mt-3 w-full flex items-center justify-center px-5 py-3 border border-transparent text-3xl font-bold rounded-md text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                          >
                            BID NOW
                          </button>

                          <p className=" text-sm text-indigo-100">
                            {/* {vehicle?.userVehicleBidsCount && vehicle?.myBidRank ? (
                  vehicle?.myBidRank == 1 ? (
                    <span style={{ color: "#00CC00" }}>Winning</span>
                  ) : (
                    <span style={{ color: "#FF3333" }}>Losing</span>
                  )
                ) : (
                  <span style={{ color: "#CCCC00" }}>Not Enrolled</span>
                )} */}
                            <div className="mt-4 w-full border-white text-center bg-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md">
                              {vehicle?.userVehicleBidsCount &&
                              vehicle?.myBidRank ? (
                                vehicle?.myBidRank == 1 ? (
                                  <p className="text-green-500 font-bold text-base space-x-1">
                                    <FontAwesomeIcon icon={faThumbsUp}  className="text-xl"/>{" "}
                                    <span className="text-green-500 uppercase  text-xl">
                                      {" "}
                                      Highest Bid
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-red-500 font-bold text-base space-x-1">
                                    <FontAwesomeIcon icon={faThumbsDown} />{" "}
                                    <span
                                      style={{ color: "#FF3333" }}
                                      className="uppercase"
                                    >
                                      Losing
                                    </span>
                                  </p>
                                )
                              ) : (
                                <p className="text-black font-bold text-base space-x-1">
                                  <FontAwesomeIcon icon={faUserSlash} />
                                  <span className="text-black uppercase">
                                    {" "}
                                    Not Enrolled{" "}
                                  </span>
                                </p>
                              )}
                            </div>
                          </p>
                          <div className="mt-4 w-full mb-2   border-white text-center bg-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md">
                            <p className=" text-xl uppercase text-black font-roboto font-semibold">
                           Approval Status
                            </p>
                            <p className="tracking-wide text-blue-500	uppercase text-xl">
                              {vehicle?.bidStatus}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
{/* BID BOX ENDS HERE */}

{/* VEHICLE DETAILS STARTS HERE */}
                  <section>
                    <div className="px-2 font-bold text-xl">
                      <div className="mb-4 text-xl text-center font-bold uppercase text-gray-900">
                        Vehicle Details
                      </div>
                      <div className="w-full  mt-4">
                        <Tab.Group>
                          <Tab.List className="flex justify-between space-x-1 rounded-xl">
                            {/* <div className="flex bg-amber-500"> */}
                            {Object.keys(tabs).map((tab) => (
                              <Tab
                                key={tab}
                                className={({ selected }) =>
                                  classNames(
                                    "w-full px-1 rounded-lg py-2.5 text-lg font-semibold leading-5 bg-gray-200",
                                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none",
                                    selected
                                      ? "bg-blue-900 text-black shadow"
                                      : "text-[#787777] hover:text-gray-900"
                                  )
                                }
                              >
                                {tab}
                              </Tab>
                            ))}
                            {/* </div> */}
                          </Tab.List>

                          <Tab.Panels className="mt-4">
                            <Tab.Panel
                              className={
                                "rounded-xl bg-white focus:outline-none"
                              }
                            >
                              <GeneralDetailsTab vehicle={vehicle} />
                            </Tab.Panel>
                            <Tab.Panel
                              className={
                                "rounded-xl bg-white  focus:outline-none"
                              }
                            >
                              <RegistrationDetailsTab vehicle={vehicle} />
                            </Tab.Panel>
                            <Tab.Panel
                              className={
                                "rounded-xl bg-white  focus:outline-none"
                              }
                            >
                              <InsuranceDetailsTab vehicle={vehicle} />
                            </Tab.Panel>
                            <Tab.Panel
                              className={
                                "rounded-xl bg-white  focus:outline-none"
                              }
                            >
                              <OtherDetailsTab vehicle={vehicle} />
                            </Tab.Panel>
                          </Tab.Panels>
                        </Tab.Group>
                      </div>
                    </div>
                  </section>

 {/* VEHILCE DETAILS ENDS HERE */}
                
              </section>
            </div>
          </div>
        </div>





      </div>
      <ImageCarouselModal
        color="blue"
        open={showImageCarouselModal}
        close={() => setShowImageCarouselModal(false)}
        images={images}
      />
    </DashboardTemplate>
  );
}

export default withPrivateRoute(Stock);

function GeneralDetailsTab(props) {
  return (
    <div className="border border-gray-200 px-4 py-5 sm:p-0 rounded">
      <dl className="sm:divide-y sm:divide-gray-200">
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className=" font-medium text-gray-500">Power Steering</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.powerSteering}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bababababase font-medium text-gray-500">Fuel Type</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.fuel}
          </dd>
        </div>

        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">Transmission</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.gearBox}
          </dd>
        </div>
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">Shape</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.shape}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">Color</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.color}
          </dd>
        </div>
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">
            Year of Manufacure
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.yearOfManufacture}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">Maker</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.make}
          </dd>
        </div>
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">State</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.state}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">City</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.city}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">Yard Name</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.yardLocation}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babababase font-medium text-gray-500">Yard Location</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.veicleLocation}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function RegistrationDetailsTab(props) {
  return (
    <div className="border border-gray-200 px-4 py-5 sm:p-0 rounded">
      <dl className="sm:divide-y sm:divide-gray-200">
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bababase font-medium text-gray-500">Reg No.</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.registrationNumber}
          </dd>
        </div>

        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bababase font-medium text-gray-500">Engine No.</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.engineNo}
          </dd>
        </div>

        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bababase font-medium text-gray-500">Chassis No.</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.chassisNo}
          </dd>
        </div>

        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bababase font-medium text-gray-500">Odometer</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.kmReading}
          </dd>
        </div>

        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bababase font-medium text-gray-500">
            Date of Registration
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.dateOfRegistration
              ? moment(props?.vehicle?.dateOfRegistration).format(
                  "MMMM Do, YYYY"
                )
              : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function InsuranceDetailsTab(props) {
  return (
    <div className="border border-gray-200 px-4 py-5 sm:p-0 rounded">
      <dl className="sm:divide-y sm:divide-gray-200">
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babase font-medium text-gray-500">
            Insurance Status
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.insuranceStatus}
          </dd>
        </div>

        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babase font-medium text-gray-500">Insurance Type</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.insurance}
          </dd>
        </div>

        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babase font-medium text-gray-500">
            Insurance Valid Till
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.insuranceValidTill
              ? moment(props?.vehicle?.insuranceValidTill).format(
                  "MMMM Do, YYYY"
                )
              : ""}
          </dd>
        </div>
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Tax</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.tax}
          </dd>
        </div>

        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-babase font-medium text-gray-500">
            Tax Validity Date
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.taxValidityDate
              ? moment(props?.vehicle?.taxValidityDate).format("MMMM Do, YYYY")
              : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function OtherDetailsTab(props) {
  return (
    <div className="border border-gray-200 px-4 py-5 sm:p-0 rounded">
      <dl className="sm:divide-y sm:divide-gray-200">
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Hypothication</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.hypothication}
          </dd>
        </div>

        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Climate Control</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.climateControl}
          </dd>
        </div>
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Door Count</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.doorCount}
          </dd>
        </div>

        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Vehicle Condition
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.vehicleCondition}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Payment Terms</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.paymentTerms}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Autobse Contact Person
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.autobse_contact_person}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Autobse Contact Number
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.autobseContact}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Customer Name</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.registeredOwnerName}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-s font-medium text-gray-500">Repo Date</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.repoDt
              ? moment(props?.vehicle?.repoDt).format("MMMM Do, YYYY")
              : ""}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Loan Agreement Number
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.loanAgreementNo}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Buyer Fees</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.buyerFees}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Parking Charge</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.parkingCharges}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">Parking Rate</dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.parkingRate}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Client Contact Person
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.clientContactPerson}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Client Contact Number
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.clientContactNo}
          </dd>
        </div>
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-bas font-medium text-gray-500">
            Additional Remarks
          </dt>
          <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
            {props?.vehicle?.additionalRemarks}
          </dd>
        </div>
      </dl>
    </div>
  );
}
