import React from 'react'
import { useCloudStore } from '../../zustand-store/cloudstorages';
import { useDeleteCloudStorage } from '../../services/CloudStorages/useMutations';
import AlertModal from '../Alert/AlertModal'


const AlertCloudModal = ({refetchCloudData}) => {
  const cloud_obj = useCloudStore((state) => state.cloud_obj);
  const setCloudStorage = useCloudStore((state) => state.setCloudStorage);
  const current_cloud_storage = useCloudStore((state) => state.current_cloud_details);
  const setCurrentCloudStorage = useCloudStore((state) => state.setCurrentCloudStorage);


  const deleteCloudMutation = useDeleteCloudStorage({
    mutationConfig: {
      onSuccess: ({ id }) => {
        setCurrentCloudStorage({ ...current_cloud_storage, isDeleteModal: false })
        setCloudStorage({
          ...cloud_obj,
          results: cloud_obj.results.filter((res) => res.id !== id),
        })
        refetchCloudData();
      },
    }
  });

  const handleDeleteCloudStorage = () => {
    deleteCloudMutation.mutate({ id: current_cloud_storage?.currentCloudStorageId });
  };


  return (
    <div>
      <AlertModal
        open={current_cloud_storage?.isDeleteModal}
        setOpen={() => setCurrentCloudStorage({ ...current_cloud_storage, isDeleteModal: false })}
        onSuccess={handleDeleteCloudStorage}
        onCancel={() => setCurrentCloudStorage({ ...current_cloud_storage, isDeleteModal: false })}
        text="Are you sure, you want to delete this cloud storage?"
        isLoading={deleteCloudMutation.isLoading}
      />

    </div>
  )
}

export default AlertCloudModal;