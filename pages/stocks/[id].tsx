import {
  ClipboardListIcon,
  DocumentReportIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/outline";
import {
  CreateBidMutationVariables,
  OrderDirection,
  useAddToWatchListMutation,
  useCreateBidMutation,
  useGetStocksQuery,
  GetStocksQueryVariables,
  GetStocksQuery,
  useSelectedVehicleQuery,
  SelectedVehicleQuery,
  SelectedVehicleQueryVariables,
  useStockVehiclesQuery,
  StockVehiclesQuery,
  StockVehiclesQueryVariables,
  useQueryQuery,
  QueryQueryVariables,
} from "@utils/graphql";
import graphQLClient from "@utils/useGQLQuery";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardTemplate from "../../components/templates/DashboardTemplate";
import Loader from "../../components/ui/Loader";
import withPrivateRoute from "../../utils/withPrivateRoute";
import { useQueryClient } from "react-query";
import { SecondsToDhms } from "@utils/common";
import TermsConditions from "@components/templates/TermsConditions";
import InspectionReportModal from "@components/modals/InspectionReportModal";
import ImageCarouselModal from "@components/modals/ImageCarouselModal";
import Swal from "sweetalert2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import TermsAndCondtionsModal from  "@components/modals/TermsAndConditionModal"
import {
  faThumbsUp,
  faThumbsDown,
  faUserSlash,
  faCircleInfo,
  faAngleRight,
  faSquarePlus,
  faSquareMinus,
} from "@fortawesome/free-solid-svg-icons";

function Stocks() {
  const router = useRouter();
  const { id, type } = router.query;
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [usrid, setUsrid] = useState("");
  const [interval, setAPIInterval] = useState(2000);
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);
  const [serverTime, setserverTime] = useState(null);
  const [showInspectionReportModal, setShowInspectionReportModal] =
    useState(false);
  const [showImageCarouselModal, setShowImageCarouselModal] = useState(false);
  const [images, setImages] = useState([]);
  const [showCode, setShowCode] = useState(false);
  const [isNotInWatchlist, setIsNotInWatchlist] = useState(true);
  const [wathclistVehicls, setWatchlistvehicls] = useState([]);
  const [demo, setDemo] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const handleClick = () => {
    setShowCode(!showCode);
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((tic) => tic + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: timeData } = useQueryQuery<QueryQueryVariables>(
    graphQLClient(),
    {},
    { refetchInterval: 1000 }
  );

  // useEffect(() => {
  //   window.location.reload();
  // }, []);

  useEffect(() => {
    if (timeData && timeData.time) {
      setTick(0);
      setserverTime(timeData.time);
    }
  }, [timeData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      setAccessToken(token);
      setUserId(id);
      setUsrid(id);
    }
  }, []);

  // console.log("access token", accessToken);

  useEffect(() => {
    const currentUrl = window.location.href;
    // console.log("currentURl", currentUrl);
    localStorage.setItem("currentUrl", currentUrl);
  }, []);

  //  fetching vechicles from url id
  const {
    data: selectedData,
    isLoading: isSelectedVehicle,
    refetch: vehicleRefetch,
  } = useSelectedVehicleQuery<SelectedVehicleQuery>(
    graphQLClient({ Authorization: `Bearer ${accessToken}` }),
    {
      where: {
        id: id as string,
      },
    }
  );

  //spliting vehicle id's
  useEffect(() => {
    if (selectedData) {
      let identifiers = selectedData?.selectedVehicle?.vehicleIds.split(",");
      setSelectedVehicles(identifiers);
    }
  }, [selectedData]);

  //fetching vehicles from api
  const {
    data: vehicles,
    isLoading,
    refetch,
  } = useStockVehiclesQuery<StockVehiclesQuery>(
    graphQLClient({ Authorization: `Bearer ${accessToken}` }),
    {
      where: { id: { in: selectedVehicles } },
      skip: 0,
      take: 100,
      userVehicleBidsOrderBy2: [{ amount: OrderDirection.Desc }],
    },
    { refetchInterval: 2000 }
  );

  console.log("stockid", selectedData);
  // console.log("usestate", selectedVehicles);
  console.log("stock vehicles", vehicles);

  const callCreateBid = useCreateBidMutation<CreateBidMutationVariables>(
    graphQLClient({ Authorization: `Bearer ${accessToken}` })
  );

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

  return (
    <DashboardTemplate
     
    >
      {isLoading ? (
        <Loader />
      ) : (
        <div className="space-y-2  sm:space-y-6  sm:mt-8 ">
          {vehicles?.vehicles?.map((item, index) => {
            const expiryTime = moment(item.bidTimeExpire);
            const currentTime = moment(serverTime).add(tick, "seconds");
            const diff = expiryTime.diff(currentTime, "seconds");

            return (
              <>
                {/* dESKTOP DESIGN  STARTS HERE*/}
                <div
                  key={`d${index}`}
                  className={`hidden sm:flex sm:max-md:flex-col font-sans border  rounded  ${
                    moment(item?.bidTimeExpire).diff(moment(), "s") <= 120 &&
                    moment(item?.bidTimeExpire).diff(moment(), "s") > 0
                      ? "blink"
                      : ""
                  }  `}
                >
                  {item?.frontImage && (
                    <div
                      className="flex-none w-70 h-56  sm:max-md:h-56 sm:max-md:w-full md:h-auto sm:w-60 relative p-6 hover:cursor-pointer"
                      onClick={() => {
                        // BindVehicleImage(item);
                        setImages((item?.frontImage).split(","));

                        setShowImageCarouselModal(true);
                      }}
                    >
                      <Image
                        alt="img"
                        src={item?.frontImage}
                        layout="fill"
                        className="absolute inset-0 w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div className={`flex-auto p-3 lg:space-y-4 sm:p-6 `}>
                    <div className="mb-3"></div>

                    <div className="sm:flex flex-wrap">
                      <div className="flex-auto">
                        <h1 className="   text-base sm:text-lg   font-bold sm:font-semibold text-blue-800 uppercase">
                          {item?.yearOfManufacture} {item?.make} -
                          {item.registrationNumber}
                        </h1>
                      </div>
                    </div>
                    <div className="">
                      <button
                        className=" sm:hidden flex justify-center w-full  text-black font-normal py-1 px-4 rounded"
                        onClick={handleClick}
                      >
                        {showCode ? (
                          <span className="text-blue-800 font-semibold">
                            {" "}
                            Hide Details
                          </span>
                        ) : (
                          <span className="text-blue-800 font-semibold">
                            {" "}
                            Show Details
                          </span>
                        )}
                      </button>
                      <div
                        className={`${
                          showCode ? "block mt-2 sm:mt-4" : "hidden"
                        } sm:block  `}
                      >
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3 text-base font-semibold">
                          <div className="sm:col-span-1 flex items-center justify-between sm:block">
                            <dt className="text- font-bold sm:font-medium text-gray-500">
                              Odometer
                            </dt>
                            <dd className="text- font-medium  text-gray-900">
                              {item?.kmReading ?? "N/A"} km
                            </dd>
                          </div>

                          <div className="sm:col-span-1 flex items-center justify-between sm:block">
                            <dt className="text- font-medium text-gray-500">
                              RC Book
                            </dt>
                            <dd className="text- font-medium  text-gray-900">
                              {item?.rcStatus}
                            </dd>
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-between sm:block">
                            <dt className="text- font-bold text-gray-500">
                              Repo date
                            </dt>
                            <dd className="text- text-gray-900">
                              {item?.repoDt
                                ? new Date(item?.repoDt).toLocaleDateString()
                                : "N/A"}
                            </dd>
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-between sm:block">
                            <dt className="text- font-bold  text-gray-500">
                              Total Bids
                            </dt>
                            <dd className="text- font-medium sm:font-normal text-gray-900">
                              {item?.totalBids}
                            </dd>
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-between sm:block">
                            <div className="sm:col-span-1 flex items-center justify-between sm:block">
                              <dt className="text- font-bold sm:font-medium text-gray-500">
                                Current Quote
                              </dt>
                              <dd className="text-base font-medium  text-gray-900">
                                {item?.currentBidAmount ?? "N/A"}
                              </dd>
                            </div>
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-between sm:block">
                            <dt className="text- font-bold sm:font-medium text-gray-500">
                              Rank
                            </dt>
                            <dd className="text-base font-medium  text-gray-900">
                              {item?.myBidRank ? item.myBidRank : "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="flex  space-x-4 mt-6 pt-4 text-sm font-medium ">
                      <div className="flex-auto flex space-x-4">
                        <div className="mt-1 flex flex-row sm:flex-wrap sm:mt-0 space-x-2 sm:space-x-6 justify-around w-full  sm:max-md:justify-around sm:max-md:w-full ">
                          <div
                            className="mt-2 flex items-center text-sm text-blue-800 hover:cursor-pointer hover:text-blue-600"
                            // onClick={() => setShowInspectionReportModal(true)}
                            onClick={() => {}}
                          >
                            <Link href={item.inspectionLink}>
                              <a
                                target="_blank"
                                className="flex items-center text-xs sm:text-sm  text-blue-800"
                              >
                                <DocumentReportIcon
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-blue-700"
                                  aria-hidden="true"
                                />
                                Inspection Report
                              </a>
                            </Link>
                          </div>
                          <div className="mt-2">
                            <Link href={`/stock/${item.id}`}>
                              <a
                                target="_blank"
                                className="flex items-center text-xs sm:text-sm  text-blue-800"
                              >
                                <ClipboardListIcon
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-blue-700"
                                  aria-hidden="true"
                                />
                                More Details
                              </a>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* starts at herer */}

                  <div className="flex border  sm:max-md:w-full text-center  ">
                    <div className="flex   items-center  justify-center  relative p-1  space-y-2">
                      <div className="  w-full h-full bg-gray-200 rounded-md">
                        <div className=" h-full w-full  flex flex-col items-center py-3 justify-around">
                          <h2 className="text-lg font-semibold text-gray-900">
                            Bid Details
                          </h2>

                          <div className="space-y-4 p-2 h-full w-full font-semibold">
                            <div className="flex items-center justify-between text-base text-gray-700">
                              <span>Start Price</span>
                              <span>₹{item?.startPrice}</span>
                            </div>
                            <div className="flex items-center justify-between text-base text-gray-700">
                              <span>Reserve Price</span>
                              <span>₹{item?.reservePrice}</span>
                            </div>
                            <div className="flex items-center justify-between text-base text-gray-700">
                              <span>Quote Increment</span>
                              <span>₹{item?.quoteIncreament}</span>
                            </div>
                            <div className="flex     items-center justify-between text-base text-gray-700">
                              <span>Current Status</span>
                              {item.userVehicleBidsCount && item.myBidRank ? (
                                item.myBidRank == 1 ? (
                                  <p className="space-x-2">
                                    <FontAwesomeIcon icon={faThumbsUp} />
                                    <span style={{ color: "#00CC00" }}>
                                      Winning
                                    </span>
                                  </p>
                                ) : (
                                  <p className="space-x-2">
                                    {" "}
                                    <FontAwesomeIcon icon={faThumbsDown} />{" "}
                                    <span style={{ color: "#FF3333" }}>
                                      Losing
                                    </span>
                                  </p>
                                )
                              ) : (
                                <p className="space-x-2">
                                  <FontAwesomeIcon icon={faUserSlash} />{" "}
                                  <span style={{ color: "#CCCC00" }}>
                                    Not Enrolled
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <EnterBid
                              row={item}
                              call={CallBid}
                              event={vehicles["vehicles"]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* end here */}
                </div>

                {/*MOBILE DESIGN STARTS HERE*/}
                <div
                  key={`d${index}`}
                  className={`sm:hidden  font-sans border-2  rounded ${
                    moment(item?.bidTimeExpire).diff(moment(), "s") <= 120 &&
                    moment(item?.bidTimeExpire).diff(moment(), "s") > 0
                      ? "blink"
                      : ""
                  } ${
                    index % 2 == 0
                      ? "border-[#A7C2FF80] bg-white "
                      : "border-[#A7C2FF80] bg-white"
                  }  `}
                >
                  {/* workbook, title, image, vehic info, add to watch, more details , inspection report */}
                  <div className="flex-auto     ">
                    {/* workbook matched button */}
                   
                    {/* title of vehicle and seller name */}
                    <div className="sm:flex flex-wrap">
                      <div className="flex-auto my-2">
                        <h1 className=" ml-4  text-base  font-roboto font-bold  text-blue-800 uppercase">
                          {item?.yearOfManufacture} {item?.make} -
                          {item.registrationNumber}
                        </h1>
                        <div className="text-sm font-medium text-black">
                          {/* {data?.event?.seller?.name} */}
                        </div>
                      </div>
                    </div>
                    {item?.frontImage && (
                      <div
                        className="flex-none w-70 h-56  sm:max-md:h-56 sm:max-md:w-full  relative p-6 m-2 hover:cursor-pointer"
                        onClick={() => {
                          // BindVehicleImage(item);
                          setImages((item?.frontImage).split(","));

                          setShowImageCarouselModal(true);
                        }}
                      >
                        <Image
                          alt="img"
                          src={item?.frontImage}
                          layout="fill"
                          className="absolute inset-0 w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-auto    ">
                    {/* vehicle information starts here */}
   {/* bid box  starts here */}
   <div className="   bg-[#E5E9F9] rounded-lg border-4  m-2">
                      <div className="px-4 py-2">
                        <h2 className="text-xl  text-gray-900  text-center font-roboto font-bold">
                          Bid Details
                        </h2>

                        <div className="space-y-2 mt-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-roboto font-medium text-xl text-[#646464]">
                              Start Price
                            </span>
                            <span className="font-bold text-2xl">
                              {" "}
                              ₹ {item?.startPrice}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-roboto font-medium text-xl text-[#646464]">
                              Reserve Price
                            </span>
                            <span className="font-bold text-2xl">
                              ₹ {item?.reservePrice}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-roboto font-medium text-xl text-[#646464]">
                              Quote Increment
                            </span>
                            <span className="font-bold text-2xl">
                              ₹ {item?.quoteIncreament}
                            </span>
                          </div>
                          <div className="flex  items-center justify-between">
                            <span className="font-bold text-xl">Current Status</span>
                            {item.userVehicleBidsCount && item.myBidRank ? (
                              item.myBidRank == 1 ? (
                                <p className="space-x-2">
                                  <FontAwesomeIcon icon={faThumbsUp} className="text-xl"/>
                                  <span
                                    style={{ color: "#00CC00" }}
                                    className="font-bold text-2xl"
                                  >
                                    Winning
                                  </span>
                                </p>
                              ) : (
                                <p className="space-x-2">
                                  {" "}
                                  <FontAwesomeIcon icon={faThumbsDown}  className="text-xl"/>{" "}
                                  <span
                                    style={{ color: "#FF3333" }}
                                    className="font-bold text-2xl"
                                  >
                                    Losing
                                  </span>
                                </p>
                              )
                            ) : (
                              <p className="space-x-2">
                                <FontAwesomeIcon icon={faUserSlash} className="text-xl"/>{" "}
                                <span
                                  style={{ color: "#CCCC00" }}
                                  className="font-bold text-2xl"
                                >
                                  Not Enrolled
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <EnterBid
                          row={item}
                          call={CallBid}
                          event={vehicles["vehicles"]}
                        />
                      </div>
                    </div>
                    {/* bid box  ends here */}
                    <div className=" mt-4 pb-3  border-zinc-200">
                      <h1 className="w-full font-bold text-xl py-2 text-center">Vehicle Details</h1>
                      <dl className="grid grid-cols-3 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-3  ">
                        <div className=" flex flex-col items-center justify-between sm:block">
                          <dt className="text-lg font-bold sm:font-medium text-gray-500">
                            Odometer
                          </dt>
                          <dd className="text-lg font-bold text-gray-900">
                            {item?.kmReading ?? "N/A"} km
                          </dd>
                        </div>
                       
                        <div className=" flex flex-col items-center justify-between sm:block">
                          <dt className="text-lg font-bold sm:font-medium text-gray-500">
                            RC Book
                          </dt>
                          <dd className="text-lg font-bold text-gray-900">
                            {item?.rcStatus}
                          </dd>
                        </div>
                        <div className=" flex flex-col items-center justify-between sm:block">
                          <dt className="text-lg font-bold  text-gray-500">
                            Repo date
                          </dt>
                          <dd className="text-lg font-bold text-gray-900">
                            {item?.repoDt
                              ? new Date(item?.repoDt).toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </div>
                        <div className=" flex flex-col items-center justify-between sm:block">
                          <dt className="text-lg font-bold sm:font-medium text-gray-500">
                            Total Bids
                          </dt>
                          <dd className="text-lg font-bold text-gray-900">
                            {item?.totalBids}
                          </dd>
                        </div>
                        <div className=" flex flex-col items-center justify-between sm:block">
                          <div className=" col-span-3 sm:col-span-1 flex max-sm:flex-col items-center justify-between sm:block  ">
                            <>
                              <dt className="text-lg font-bold sm:font-medium text-gray-500">
                                Current Quote
                              </dt>
                              <dd className="text-lg font-bold text-gray-900">
                                {item?.currentBidAmount ?? "N/A"}
                              </dd>
                            </>
                          </div>
                        </div>
                        <div className=" flex flex-col items-center justify-between sm:block">
                          <dt className="text-lg font-bold sm:font-medium text-gray-500">
                            Rank
                          </dt>
                          <dd className="text-lg  font-bold text-gray-900">
                            {item?.myBidRank ? item.myBidRank : "N/A"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    {/* vehicle information ends here */}

                    {/* add to watchlist, more details, inspection report starts here  */}
                    <div className="flex sm:hidden space-x-4 space-y-6 pb-4 pr-1 text-sm font-medium ">
                      <div className="flex-auto flex flex-col  justify-center items-center  space-x-4 space-y-6 ">
                        <div className="mt-1 flex   space-x-2 space-y-4  justify-around w-full    ">
                          
                          <div className="flex my-2 w-full justify-around items-center">
                            {/* INSPECTION REPORT STARTS HERE */}
                            <div
                              className=" flex items-center justify-between text-lg  font-medium text-blue-800 "
                              onClick={() => setShowInspectionReportModal(true)}
                            >
                              <Link href={item.inspectionLink}>
                                <a
                                  target="_blank"
                                  className="flex items-center text-lg font-roboto font-bold text-[#2563EB]"
                                >
                                  Inspection Report
                                </a>
                              </Link>

                              {/* <FontAwesomeIcon icon={faCircleInfo} /> */}
                            </div>

                            {/* INSPECTION REPORT ENDS HERE */}

                            {/* MORE DETAILS STARTS HERE */}

                            <div className=" flex items-center justify-between text-lg text-blue-800 ">
                              <Link href={`/stock/${item.id}`}>
                                <a
                                  target="_blank"
                                  className="flex items-center text-lg  text-[#2563EB] font-bold"
                                >
                                  More Details
                                </a>
                              </Link>
                              {/* <FontAwesomeIcon icon={faAngleRight} /> */}
                            </div>
                            {/* MORE DETAILS ENDS  HERE */}
                          </div>
                        </div>
                        {/* Add and Remove from watchlist starts here  */}
                        <></>
                        {/* Add and Remove from watchlist ends here */}
                      </div>
                    </div>

                    {/* new code  ends here for bid timing*/}

                    {/* bid timing showing Ends here */}

                 

                    {/* bid box and bid timing ends here */}
                  </div>

                  {/* bid box and bid timing ends here */}
                </div>

                {/* MOBILE DESIGNS  ENDS HERE */}
              </>
            );
          })}
        </div>
      )}
      <InspectionReportModal
        color="blue"
        open={showInspectionReportModal}
        close={() => setShowInspectionReportModal(false)}
      />
      <ImageCarouselModal
        color="blue"
        open={showImageCarouselModal}
        close={() => setShowImageCarouselModal(false)}
        images={images}
      />
    </DashboardTemplate>
  );
}

export default withPrivateRoute(Stocks);

const EnterBid = ({ row, call, event }) => {
  const [bidAmount, setBidAmount] = useState("");

  console.log("row from bid button", row);
  console.log("event from bid button", event);

  useEffect(() => {
    console.log("");

    if (row.currentBidAmount !== null && row.currentBidAmount !== undefined) {
      setBidAmount(row.currentBidAmount + +row?.quoteIncreament);
    } else if (row.startPrice) {
      setBidAmount(row.startPrice);
    } else if (!row?.startPrice) {
      setBidAmount(row?.quoteIncreament);
    }
  }, [event, row]);

  useEffect(() => {
    if (event?.bidLock === "locked") {
      if (row.currentBidAmount) {
        setBidAmount(row.currentBidAmount + +row?.quoteIncreament);
      } else if (row.startPrice) {
        setBidAmount(row.startPrice);
      } else if (!row?.startPrice) {
        setBidAmount(row?.quoteIncreament);
      }
    } else {
      if (row.currentBidAmount) {
        let amt = row?.userVehicleBids?.length
          ? row?.userVehicleBids[0]?.amount + +row?.quoteIncreament
          : row.startPrice;
        setBidAmount(amt.toString());
      } else if (row.startPrice) {
        setBidAmount(row.startPrice);
      } else if (!row?.startPrice) {
        setBidAmount(row?.quoteIncreament);
      }
    }
  }, [event?.bidLock, row]);

  const enrolled = row.userVehicleBidsCount > 0;

  return (
    <div className="p-2">
      <input
        id="input"
        className="w-full border border-gray-500 px-5 py-2 placeholder-gray-500 focus:outline-none rounded-md text-2xl"
        placeholder="Enter amount"
        // defaultValue={row.currentBidAmount !==0 ? row.currentBidAmount  :row.startPrice }
        value={bidAmount !== "0" ? bidAmount : row.startPrice}
        onChange={(e) => {
          setBidAmount(e.target.value.replace(/\D/g, ""));
        }}
      />

      <button
        type="submit"
        className="mt-2 w-full flex items-center justify-center px-5 py-2  border border-transparent text-2xl font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        onClick={() => {
          if (parseInt(bidAmount) === 0) {
            call(row.startPrice, row.id);
            setTimeout(() => {
              // setBidAmount("");
            }, 1000);
          } else if (
            event?.bidLock === "locked" &&
            row?.currentBidAmount >= parseInt(bidAmount)
          ) {
            Swal.fire({
              title: "Bid amount should be greater than last bid",
              confirmButtonText: "OK",
              position: "top",
            });
          } else if (parseInt(bidAmount) % row.quoteIncreament !== 0) {
            Swal.fire({
              title:
                "Bid amount should be greater than minimum quote increment.",
              confirmButtonText: "OK",
              position: "top",
            });
          } else if (row.startPrice > parseInt(bidAmount)) {
            Swal.fire({
              title: "Bid amount should be greater than start price.",
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
            call(bidAmount, row.id);
            setTimeout(() => {
              // setBidAmount("");
            }, 1000);
          }
        }}
      >
        Bid Now
      </button>
    </div>
  );
};
