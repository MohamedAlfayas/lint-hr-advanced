import React, { useState } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { OrganizationChart } from 'primereact/organizationchart';
import { useDispatch } from 'react-redux';
import { setComponentToShow, setFormObj, setFormTitle, setFormWidthPercentage, toggleRSBView } from '../../redux/reducers/ChildReducer/RightSideBarReducer';


const DepartmentsTab = () => {

  const dispatch = useDispatch()

  const handleDepartmentEdit = () =>{
    dispatch(setFormTitle("Department"));
    dispatch(setFormObj({
      id : "0",
      name : "",
      head_department : 1,
      description : "",
    }));
    dispatch(setFormWidthPercentage("50%"))
    dispatch(setComponentToShow('department'));
    dispatch(toggleRSBView(true));
  }


  const [data] = useState([
    {
      label: 'Argentina',
      expanded: true,
      children: [
        {
          label: 'Argentina',
          expanded: true,
          children: [
            {
              label: 'Argentina'
            },
            {
              label: 'Croatia'
            }
          ]
        },
        {
          label: 'France',
          expanded: true,
          children: [
            {
              label: 'France'
            },
            {
              label: 'Morocco'
            }
          ]
        }
      ]
    }
  ]);


  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <h5 className="card-title">Department</h5>
          <Button onClick={() => handleDepartmentEdit()}>
            Edit Department
          </Button>
          <div className="card overflow-x-auto">
            <OrganizationChart value={data} />
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default DepartmentsTab;
