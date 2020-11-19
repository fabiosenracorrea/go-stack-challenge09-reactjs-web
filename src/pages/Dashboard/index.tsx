import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data: apiFoods } = await api.get('/foods');

      setFoods(apiFoods);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const id = foods.length + 1;

        const newFood = {
          ...food,
          id,
          available: true,
        };

        await api.post('/foods', newFood);

        setFoods(oldFoods => [...oldFoods, newFood]);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      const updatedFood = { ...editingFood, ...food };

      try {
        await api.put(`/foods/${updatedFood.id}`, updatedFood);

        const updatedFoods = [...foods];
        const updatedIndex = updatedFoods.findIndex(
          toFindFood => toFindFood.id === updatedFood.id,
        );

        updatedFoods[updatedIndex] = updatedFood;

        setFoods(updatedFoods);

        setEditingFood({} as IFoodPlate);
      } catch (err) {
        console.log(err);
      }
    },
    [editingFood, foods],
  );

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      try {
        await api.delete(`/foods/${id}`);

        const updatedFoods = foods.filter(food => food.id !== id);

        setFoods(updatedFoods);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const toggleModal = useCallback((): void => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback((): void => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback(
    (food: IFoodPlate): void => {
      setEditingFood(food);
      toggleEditModal();
    },
    [toggleEditModal],
  );

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />

      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {!!foods[0] &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
