import { useEffect, useMemo, useRef, useState } from "react";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { ReactComponent as Cloud } from '../../../src/assets/svgs/cloud.svg';
import { ReactComponent as CloudLogo } from '../../../src/assets/svgs/cloud-logo.svg';
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate } from "react-router";
import CardLoader from "../../components/loader/cardLoader";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import useUrlQuery from "../../hooks/useUrlQuery";
import TopBar from "../../components/TopBar/TopBar";
import Pagination from "../../components/Pagination/Pagination";
import { CloudStorageMenu } from "../../components/CloudComponents/CloudStorageMenu";
import { useGetCloud } from "../../services/CloudStorages/useQueries";
import { useCloudStore } from "../../zustand-store/cloudstorages";
import AlertCloudModal from "../../components/CloudComponents/AlertCloudModal";
import { cloudStorageStatusApi } from "../../services/cloudstorages.services";
import { STATUS_COLORS } from "../../constants/cloudStatus";
const pageSize = 11;

export default function CloudStoragePage() {
  const navigate = useNavigate();
  let urlQuery = useUrlQuery();
  const prevIdsRef = useRef([]);
  dayjs.extend(relativeTime);

  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState([]);

  const currentPage = parseInt(urlQuery.get("page"));

  const cloud_obj = useCloudStore((state) => state.cloud_obj);
  const setCloudStorage = useCloudStore((state) => state.setCloudStorage);

  const filters = [
    {
      id: "quick_filter",
      name: "Quick Filter",
      options: [
        {
          label: "Owned by me",
          value: '{"and":[{"==":[{"var":"owner"},"<username>"]}]}',
        },
        {
          label: "AWS Storage",
          value: '{"and":[{"==":[{"var":"provider_type"},"AWS_S3_BUCKET"]}]}',
        },
      ],
    },
  ];

  const getCloudQuery = useGetCloud({
    queryConfig: {
      queryKey: [pageSize, currentPage, searchValue, appliedFilters],
      apiParams: {
        page: currentPage,
        page_size: pageSize,
        search: searchValue,
        ...(appliedFilters.length > 1
          ? {
            filter: JSON.stringify({
              and: appliedFilters.map((filter) => JSON.parse(filter))
            })

          } : {
            filter: appliedFilters[0]
          })

      },
      enabled: true,
      onSuccess: (data) => setCloudStorage(data)

    }
  });
  const ids = useMemo(() => (getCloudQuery?.data?.results || []).map((val) => val.id), [getCloudQuery]);

  useEffect(() => {
    const idsChanged =
      ids.length !== prevIdsRef.current.length ||
      ids.some((id, index) => id !== prevIdsRef.current[index]);

    if (ids.length > 0 && idsChanged) {
      const dataPromises = ids.map((id) => cloudStorageStatusApi({ id }));

      Promise.allSettled(dataPromises)
        .then((results) => {
          const statuses = results.reduce((acc, result, index) => {
            if (result.status === "fulfilled") {
              acc[ids[index]] = result.value;
            }
            return acc;
          }, {});

          setStatus(statuses);
        })
        .catch((err) => {
          console.error("Error fetching data:", err.message);
        });

      prevIdsRef.current = ids;
    }
  }, [ids]);

  const filterHandler = (event) => {
    if (event.target.checked) {
      setAppliedFilters([...appliedFilters, event.target.value]);
    } else {
      setAppliedFilters(
        appliedFilters.filter((filterTag) => filterTag !== event.target.value)
      );
    }
  };
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white dark:text-gray-100">
              Cloud Storages
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full">
          <TopBar
            filters={filters}
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
          >
            <button
              onClick={() => navigate("/cloud-storages/create")}
              className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 dark:bg-audino-gradient bg-audino-primary p-2 rounded-md"
            >
              <Cloud className="h-5 w-5 text-white" />
            </button>
          </TopBar>
          {!getCloudQuery || (cloud_obj?.results.length === 0 && !getCloudQuery.isLoading) ? (
            <div className="flex flex-col justify-center items-center my-14 text-gray-500 dark:text-white text-sm">
              <CloudLogo className="h-24 text-gray-500 dark:text-white" />
              <div className="flex flex-col justify-center items-center text-center">
                <h2 className="font-bold">No cloud storages attached yet...</h2>
                <p className="dark:text-gray-400">To get started with your cloud storage</p>
                <p
                  className="text-audino-primary-dark cursor-pointer"
                  onClick={() => navigate("/cloud-storages/create")}
                >
                  attach a new one
                </p>
              </div>
            </div>

          ) : (<>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {/* new project  */}
              {getCloudQuery.isLoading || getCloudQuery.isRefetching
                ? [...Array(5).keys()].map((load) => (
                  <li
                    key={`CardLoader-${load}`}
                    className="col-span-1 divide-y divide-gray-200 dark:divide-audino-gray rounded-lg bg-white dark:bg-audino-midnight shadow cursor-pointer py-8 sm:py-0"
                    onClick={() => navigate("create")}
                  >
                    <CardLoader />
                  </li>
                ))
                : cloud_obj.results.map((cloud) => (
                  <li
                    key={cloud.id}
                    className="relative col-span-1 dark:border dark:border-audino-gray rounded-lg bg-white dark:bg-audino-midnight shadow"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-md font-medium text-gray-900 dark:text-white">
                            {`#${cloud.id}: ${cloud.display_name}`}
                          </h3>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-white">
                          Provider: {cloud.provider_type}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-white">
                          Created by <span className="dark:text-audino-primary">{cloud.owner.username}</span>
                        </p>
                        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-white">
                          Last updated {dayjs(cloud.updated_date).fromNow()}
                        </p>
                        <div className={`mt-0.5 truncate text-sm ${STATUS_COLORS[status[cloud.id]]?.color || STATUS_COLORS.LOADING.color} flex gap-2`}>
                          <p className="text-gray-500 dark:text-white">status:</p>{STATUS_COLORS[status[cloud.id]]?.text || STATUS_COLORS.LOADING.text}
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-5 right-4  ">
                      <CloudStorageMenu cloud={cloud} />
                    </div>
                  </li>
                ))}

            </ul>
            {/* pagination */}
            <Pagination
              resultObj={cloud_obj}
              pageSize={pageSize}
              currentPage={currentPage}
            />

          </>)}

        </div>
        {/* confirmation modal */}
        <AlertCloudModal refetchCloudData={getCloudQuery.refetch} />

      </main>
    </>
  );
}
