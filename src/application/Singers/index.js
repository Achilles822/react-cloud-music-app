import React, { useState, useEffect } from 'react';
import Horizen from '../../baseUI/horizen-item';
import { categoryTypes, alphaTypes } from '../../api/config';
import {
    NavContainer,
    ListContainer,
    List,
    ListItem
} from "./style";
import Scroll from '../../baseUI/Scroll'
import {
    getSingerList,
    getHotSingerList,
    changeEnterLoading,
    changePageCount,
    refreshMoreSingerList,
    changePullUpLoading,
    changePullDownLoading,
    refreshMoreHotSingerList
} from './store/actionCreators';
import { connect } from 'react-redux';
import LazyLoad, { forceCheck } from 'react-lazyload';
import Loading from '../../baseUI/Loading';
function Singers(props) {
    let [category, setCategory] = useState('');
    let [alpha, setAlpha] = useState('');

    const { singerList, enterLoading, pullUpLoading, pullDownLoading, pageCount } = props;

    const { getHotSingerDispatch, updateDispatch, pullDownRefreshDispatch, pullUpRefreshDispatch } = props;

    useEffect(() => {
        getHotSingerDispatch();
        // eslint-disable-next-line
    }, []);

    let handleUpdateAlpha = (val) => {
        setAlpha(val);
        updateDispatch(category, val);
    };

    let handleUpdateCatetory = (val) => {
        setCategory(val);
        updateDispatch(val, alpha);
    };

    const handlePullUp = () => {
        pullUpRefreshDispatch(category, alpha, category === '', pageCount);
    };

    const handlePullDown = () => {
        pullDownRefreshDispatch(category, alpha);
    };

    // const singerList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(item => {
    //     return {
    //         picUrl: "https://p2.music.126.net/uTwOm8AEFFX_BYHvfvFcmQ==/109951164232057952.jpg",
    //         name: "隔壁老樊",
    //         accountId: 277313426,
    //     }
    // });

    // 渲染函数，返回歌手列表
    const renderSingerList = () => {
        return (
            <List>
                {
                    singerList.map((item, index) => {
                        return (
                            <ListItem key={item.accountId + "" + index}>
                                <div className="img_wrapper">
                                    <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music" />
                                </div>
                                <span className="name">{item.name}</span>
                            </ListItem>
                        )
                    })
                }
            </List>
        )
    };
    return (
        <div>
            <NavContainer>
                <Horizen
                    list={categoryTypes}
                    title={"分类 (默认热门):"}
                    handleClick={(val) => handleUpdateCatetory(val)}
                    oldVal={category}></Horizen>
                <Horizen
                    list={alphaTypes}
                    title={"首字母:"}
                    handleClick={val => handleUpdateAlpha(val)}
                    oldVal={alpha}></Horizen>
            </NavContainer>
            <ListContainer>
                <Scroll
                    pullUp={handlePullUp}
                    pullDown={handlePullDown}
                    pullUpLoading={pullUpLoading}
                    pullDownLoading={pullDownLoading}
                >
                    {renderSingerList()}
                </Scroll>
            </ListContainer>
        </div>
    )
}

const mapStateToProps = (state) => ({
    singerList: state.getIn(['singers', 'singerList']),
    enterLoading: state.getIn(['singers', 'enterLoading']),
    pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
    pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
    pageCount: state.getIn(['singers', 'pageCount'])
})

const mapDispatchToProps = (dispatch) => {
    return {
        getHotSingerDispatch() {
            dispatch(getHotSingerList())
        },
        updateDispatch(category, alpha) {
            dispatch(changePageCount(0));//由于改变了分类，所以pageCount清零
            dispatch(changeEnterLoading(true));//loading，现在实现控制逻辑，效果实现放到下一节，后面的loading同理
            dispatch(getSingerList(category, alpha));
        },
        // 滑到最底部刷新部分的处理
        pullUpRefreshDispatch(category, alpha, hot, count) {
            dispatch(changePullUpLoading(true));
            dispatch(changePageCount(count + 1));
            if (hot) {
                dispatch(refreshMoreHotSingerList());
            } else {
                dispatch(refreshMoreSingerList(category, alpha));
            }
        },
        //顶部下拉刷新
        pullDownRefreshDispatch(category, alpha) {
            dispatch(changePullDownLoading(true));
            dispatch(changePageCount(0));//属于重新获取数据
            if (category === '' && alpha === '') {
                dispatch(getHotSingerList());
            } else {
                dispatch(getSingerList(category, alpha));
            }
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Singers);