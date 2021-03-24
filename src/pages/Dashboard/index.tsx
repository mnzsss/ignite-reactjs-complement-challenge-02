import { useCallback, useEffect, useState } from "react";

import { Header } from "../../components/Header";
import api from "../../services/api";
import { ModalAddFood } from "../../components/ModalAddFood";
import { ModalEditFood } from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";
import { Food } from "../../components/Food";

interface IFood {
  id: number;
  available: boolean;
  description: string;
  image: string;
  name: string;
  price: string;
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
  const [foods, setFoods] = useState<IFood[]>([]);

  useEffect(() => {
    async function loadFoods() {
      const { data } = await api.get<IFood[]>("/foods");

      setFoods(data);
    }

    loadFoods();
  }, []);

  const handleAddFood = async (food: IFood) => {
    try {
      const { data } = await api.post("/foods", {
        ...food,
        available: true,
      });

      setFoods((old) => [...old, data]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateFood = useCallback(
    async (food: IFood) => {
      try {
        const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
          ...editingFood,
          ...food,
        });

        const foodsUpdated = foods.map((f) =>
          f.id !== foodUpdated.data.id ? f : foodUpdated.data
        );

        setFoods(foodsUpdated);
      } catch (err) {
        console.log(err);
      }
    },
    [editingFood, foods]
  );

  const handleDeleteFood = useCallback(
    async (id) => {
      await api.delete(`/foods/${id}`);

      const foodsFiltered = foods.filter((food) => food.id !== id);

      setFoods(foodsFiltered);
    },
    [foods]
  );

  const handleEditFood = (food: IFood) => {
    setEditingFood(food);
    setEditModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen((old) => !old);
  };

  const toggleEditModal = () => {
    setEditModalOpen((old) => !old);
  };

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
        {foods &&
          foods.map((food) => (
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
}
