import React, { useEffect, useMemo, useState } from "react";

//libraries
import { 
    Button, 
    Space, 
    Select, 
    Modal 
} from "antd";

const AssistantTeamAssignModal = ({ data }) => {
    const {
        selectedAssistant,
        setSelectedAssistant,
        teamList, 
        handleAssignTeamToAssistant,
        isTeamAssigning
    } = data;
    const [selectedTeamList, setSelectedTeamList] = useState([]);

    //----Side effects---------//
    useEffect(() => {
        if(selectedAssistant !== null && selectedAssistant) {
            setSelectedTeamList(() => {
                return selectedAssistant?.teamId?.map(team => team._id)
            });
        }
    }, [selectedAssistant]);


    //------local functions------//
    const handleChange = (value) => {
        setSelectedTeamList(value);
    };

    const teamOptions = useMemo(() => {
        if (teamList && teamList.length) {
            return teamList.map((team) => {
                return {
                    label: team.teamTitle,
                    value: team._id,
                };
            });
        } else {
            return [];
        }
    }, [teamList]);

    const handleTeamAssignFromModal = () => {
        handleAssignTeamToAssistant(selectedAssistant._id, selectedTeamList, () => {
            setSelectedAssistant(null);
        })
    }


    return (
        <Modal
            title={`Assign teams to ${selectedAssistant?.name}`}
            open={selectedAssistant}
            onCancel={() => setSelectedAssistant(null)}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    <Button disabled={isTeamAssigning} onClick={() => setSelectedAssistant(null)} >Cancel</Button>
                    <Button disabled={isTeamAssigning} onClick={handleTeamAssignFromModal} type="primary">{isTeamAssigning ? 'Saving...' : 'Save'}</Button>
                </>
            )}
        >
            <Select
                mode="multiple"
                style={{
                    width: "100%",
                }}
                placeholder="select teams"
                value={selectedTeamList}
                onChange={handleChange}
                optionLabelProp="label"
                options={teamOptions}
                optionRender={(option) => (
                    <Space>
                        <span role="img" aria-label={option.data.label}>
                            {option.data.label}
                        </span>
                    </Space>
                )}
            />
        </Modal>
    );
};

export default AssistantTeamAssignModal;
