import {
  faThumbsUp,
  faThumbsDown,
  faUserSlash,
  faLocationPin,
  faMapLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Sections = ({ header, value }) => {
  return (
    <div>
      <h1 className="text-xl  text-center uppercase font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate p-2"></h1>
      <div className="flex flex-col px-4 p-1">
        <dd className="font-bold">Bharat benz </dd>
        <div className="flex space-x-2">
        <p>
          
          <FontAwesomeIcon icon={faLocationPin} />{" "}
        </p>
          <dd>thrussur </dd>
          
        </div>
      </div>
      <div className="grid grid-cols-2 place-items-start gap-4 border  px-4 p-2">
        <div className="flex flex-col ">
          <dd className="text-zinc-400 font-inter">Posted by</dd>{" "}
          <dt className="font-bold ">{value.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Repo Date</dd>{" "}
          <dt className="font-bold">{value?.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Event Id</dd>{" "}
          <dt className="font-bold">{value.bankName}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Vehicle Id</dd>{" "}
          <dt className="font-bold">{value.seller}</dt>
        </div>
      </div>
    </div>
  );
};
export const ContactSection = ({ header, value }) => {
  return (
    <div>
      <h1 className="text-lg  border bg-gray-200   font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate p-2">
        Contact Details
      </h1>
      <div className="grid grid-cols-2 place-items-start gap-4  px-4 p-2">
        <div className="flex flex-col ">
          <dd className="text-zinc-400 font-inter">Posted by</dd>{" "}
          <dt className="font-bold ">{value.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Repo Date</dd>{" "}
          <dt className="font-bold">{value?.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Event Id</dd>{" "}
          <dt className="font-bold">{value.bankName}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Vehicle Id</dd>{" "}
          <dt className="font-bold">{value.seller}</dt>
        </div>
      </div>
    </div>
  );
};
export const VehicleDetails = ({ header, value }) => {
  return (
    <div>
      <h1 className="text-lg  border bg-gray-200   font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate p-2">
        VehicleDetails{" "}
      </h1>

      <div className="grid grid-cols-2 place-items-start gap-4  px-4 p-2">
        <div className="flex flex-col ">
          <dd className="text-zinc-400 font-inter">Posted by</dd>{" "}
          <dt className="font-bold ">{value.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Repo Date</dd>{" "}
          <dt className="font-bold">{value?.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Event Id</dd>{" "}
          <dt className="font-bold">{value.bankName}</dt>
        </div>
        <div className="flex flex-col">
            <div className=".0
            "></div>
          <dd className="text-zinc-400 font-inter">Vehicle Id</dd>{" "}
          <dt className="font-bold">{value.seller}</dt>
        </div>
        <div className="flex flex-col ">
          <dd className="text-zinc-400 font-inter">Posted by</dd>{" "}
          <dt className="font-bold ">{value.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Repo Date</dd>{" "}
          <dt className="font-bold">{value?.seller}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Event Id</dd>{" "}
          <dt className="font-bold">{value.bankName}</dt>
        </div>
        <div className="flex flex-col">
          <dd className="text-zinc-400 font-inter">Vehicle Id</dd>{" "}
          <dt className="font-bold">{value.seller}</dt>
        </div>
      </div>
    </div>
  );
};


export const moreDetails = ({ header, value }) => {
    return (
      <div>
        <h1 className="text-lg  border bg-gray-200   font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate p-2">
          Contact Details
        </h1>
        <div className="grid grid-cols-2 place-items-start gap-4  px-4 p-2">
          <div className="flex flex-col ">
            <dd className="text-zinc-400 font-inter">Posted by</dd>{" "}
            <dt className="font-bold ">{value.seller}</dt>
          </div>
          <div className="flex flex-col">
            <dd className="text-zinc-400 font-inter">Repo Date</dd>{" "}
            <dt className="font-bold">{value?.seller}</dt>
          </div>
          <div className="flex flex-col">
            <dd className="text-zinc-400 font-inter">Event Id</dd>{" "}
            <dt className="font-bold">{value.bankName}</dt>
          </div>
          <div className="flex flex-col">
            <dd className="text-zinc-400 font-inter">Vehicle Id</dd>{" "}
            <dt className="font-bold">{value.seller}</dt>
          </div>
        </div>
      </div>
    );
  };