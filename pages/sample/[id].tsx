import {
    ClipboardListIcon,
    DocumentReportIcon,
    PlusIcon,
    MinusIcon,
  } from "@heroicons/react/outline";
  import {
    CreateBidMutationVariables,
    GetEventQuery,
    LiveWatchListItemQueryVariables,
    OrderDirection,
    QueryQueryVariables,
    useAddToWatchListMutation,
    useCreateBidMutation,
    useGetEventQuery,
    useLiveWatchListItemQuery,
    useQueryQuery,
    useUserWorkBookQuery,
    UserWorkBookQueryVariables,
    useFindAuctionsQuery,
    useGetStocksQuery,
    GetStocksQueryVariables
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

const Sample = () => {
    const router = useRouter();

    const { id, type } = router.query;
    const [accessToken, setAccessToken] = useState("");
    const [userId, setUserId] = useState("");
    const [usrid, setUsrid] = useState("");
    const [interval, setAPIInterval] = useState(2000);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          const id = localStorage.getItem("id");
    
          setAccessToken(token);
          setUserId(id);
          setUsrid(id);
        }
      }, []);

      console.log('access token from sample',accessToken);

     

      const {data,isLoading:stocksLoading,refetch}=useGetStocksQuery<GetStocksQueryVariables>(
        graphQLClient({ Authorization: `Bearer ${accessToken}` }),{
          where: {
            id: "clvq8zlzv4230vxqujyoxc9mm"
          },
          take: 10,
          userVehicleBidsOrderBy2: {
            amount: OrderDirection.Asc
          },
          skip: 0,
          orderBy: [
            {
              vehicleIndexNo: OrderDirection.Asc
            }
          ],
          vehiclesWhere2: {
            AND: [
              {
                id: {
                  in:["clvq95t3j10547vxqucaaarmvg","clvq95t3t10570vxqu1bri51xc"]
                }
          }
        ]
      }
        }
      )

      console.log('data of stock',data);
      useEffect(()=>{
        refetch()
      },[data])
      

      
  return (
    <div>Sample</div>
  )
}

export default Sample