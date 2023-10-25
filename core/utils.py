import ast
from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination


def get_paginator(page=1, page_size=5):
    paginator = PageNumberPagination()
    paginator.page_query_param = page
    paginator.page_size = page_size
    return paginator


def ordered_dict_to_dict(input_dict):
    if isinstance(input_dict, OrderedDict):
        return {key: ordered_dict_to_dict(value) for key, value in input_dict.items()}
    elif isinstance(input_dict, list):
        return [ordered_dict_to_dict(item) for item in input_dict]
    else:
        return input_dict


def convert_string_lists_to_lists(input_dict, key_str="values"):
    data = ordered_dict_to_dict(input_dict)

    if isinstance(data, list):
        return [convert_string_lists_to_lists(item) for item in data]
    elif isinstance(data, dict):
        return {
            key: convert_string_lists_to_lists(value) for key, value in data.items()
        }
    elif isinstance(data, str):
        try:
            return ast.literal_eval(data)
        except (SyntaxError, ValueError):
            return data
    else:
        return data
